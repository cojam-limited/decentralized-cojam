import React, { useState, useEffect, useMemo } from "react";
import { useHistory } from "react-router-dom";

import Moment from 'moment';

import "react-datepicker/dist/react-datepicker.css";

import { urlFor, client } from "../../../sanity";
import { useLoadingState } from "@assets/context/LoadingContext";

import "react-responsive-modal/styles.css";
import { useWalletData } from '@data/wallet';
import { checkLogin } from "@api/UseTransactions";

import toastNotify from '@utils/toast';
import GovernanceContractABI from "../../../api/ABI/GovernanceContractABI.json"
import NftContractABI from "../../../api/ABI/NftContractABI.json"
import MarketContractABI from "../../../api/ABI/CojamMarketContractABI.json"
import Web3 from "web3";

function Index() {
  const { walletData } = useWalletData();

  const { setLoading } = useLoadingState();
  const history = useHistory();

  const [ listData, setListData ] = useState([]);
  const [ activeCategory, setActiveCategory ] = useState('draft');
  const [ nowTime, setNowTime ] = useState(new Date());
  const [ newAccount, setNewAccount ] = useState(window?.klaytn?.selectedAddress?.toLowerCase());
  const [ adminAddressDB, setAdminAddressDB ] = useState('');
  // useMemo(() => {
  //   setInterval(() => {
  //     setNowTime(new Date())
  //   }, 1000)
  // })

  const categories = [
    {CategoryName: 'draft'},
    {CategoryName: 'success'},
    {CategoryName: 'answer'}
  ];

  const answerList = [
    {title: 'Approve'},
    {title: 'Reject'}
  ];

  const web3 = new Web3(window.klaytn);
  const governanceContractAddress = process.env.REACT_APP_GOVERNANCE_ADDRESS;
  const nftContractAddress = process.env.REACT_APP_NFTCONTRACT_ADDRESS;
  const amdinContractAddress = process.env.REACT_APP_ADMIN_ADDRESS;

  // klaytn Account Change 감지
  window.klaytn.on('accountsChanged', (accounts) => {
    setNewAccount(accounts[0]);
  });

  useEffect(async () => {
    setLoading(true);
    // GovernanceItem list 조회
    const governanceVoteQuery = `*[_type == 'governanceItem']
    {
      ...,
      'quest': *[_type == 'quests' && _id == ^.questKey._ref][0]
    }`;
    client.fetch(governanceVoteQuery).then((governanceItem) => {
      governanceItem.map((value) => {
        if(value.quest !== null || undefined){
          listData.push(value)
        }
      })
      setLoading(false);
    })    
  }, [activeCategory])

  useEffect(() => {
    const AdminAddressQueryh = `*[_type == 'admin' && active == true]`
    client.fetch(AdminAddressQueryh).then((adminlist) => {
      adminlist.map((admin) => {
        if(admin.walletAddress.toLowerCase() === amdinContractAddress.toLowerCase()) {
          setAdminAddressDB(admin.walletAddress);
        }
      })
    })
  }, []);
  
  useEffect(async () => {
    if(newAccount !== undefined || null) {
      toastNotify({
        state: 'success',
        message: `Success Login Account\n"${newAccount}"`,
      });
    }
  }, [newAccount])


  const NftContract = () => {
    return new web3.eth.Contract(NftContractABI, nftContractAddress)
  }

  const MarketContract = () => {
    return new web3.eth.Contract(MarketContractABI, '0x99d3a9ba2ae0320b6fab408fd4b3aa71a8e3d6b4')
  }

  // 블록체인에 Quest 등록
  const GovernanceContract = () => {
    return new web3.eth.Contract(GovernanceContractABI, governanceContractAddress) 
  }

  const DraftVoteGovernance = async (questKey, answer, _id) => {
    const accounts = await window.klaytn.enable()
    const account = accounts[0];
    const balance = await NftContract().methods.balanceOf(account).call();

    if(Number(balance) <= 0) {
      toastNotify({
        state: 'error',
        message: 'You Need Membership NFT',
      })
      return;
    }

    setLoading(true);

    try {
      const receipt = await GovernanceContract().methods.voteQuest(questKey, answer).send({from : account})
      const returnValue = receipt?.events?.VoteQuestCast?.returnValues;

      const GovernanceItemVoteCreate = {
        _type: 'governanceItemVote',
        governanceItemId: _id,
        voter: returnValue.voter.toLowerCase(),
        draftOption: returnValue.answer,
        draftCount: returnValue.votedNfts.length,
        draftTxHash: receipt?.transactionHash,
      }

      await client.create(GovernanceItemVoteCreate);

      // update draft total amount
      const newDraftTotalQuery = `*[_type == 'governanceItem' && references('${_id}')]`;
      await client.fetch(newDraftTotalQuery).then(async (vote) => {
        const questId = vote[0]._id;
        const draftApproveTotal = vote[0].approveTotalVote;
        const draftRejectTotal = vote[0].rejectTotalVote;

        if(answer === 'approve') {
          const newDraftApproveTotal = draftApproveTotal + returnValue.votedNfts.length;

          await client.patch(questId).set({approveTotalVote: newDraftApproveTotal}).commit();
        } else if(answer === 'reject') {
          const newDraftRejectTotal = draftRejectTotal + returnValue.votedNfts.length;

          await client.patch(questId).set({rejectTotalVote: newDraftRejectTotal}).commit();
        }
      });
      setLoading(false);
    } catch (error) {
      console.error('DraftVoteGovernance', error);
      setLoading(false);
    }
  };

  const DraftResultHandler = (_id) => {
    const newDraftTotalQuery = `*[_type == 'governanceItem' && references('${_id}')]
    {
      ...,
      'questKey': *[_type == 'quests' && _id == ^.questKey._ref][0]
    }`;
    client.fetch(newDraftTotalQuery).then( async (vote) => {
      const approveVote = vote[0].approveTotalVote;
      const rejectVote = vote[0].rejectTotalVote;
      const totalVote = approveVote + rejectVote;
      const questKey = vote[0].questKey.questKey;
      const nowTime = new Date();
      const endTime = new Date(vote[0].draftEndTime);
      const diff = endTime - nowTime;
      const accounts = await window.klaytn.enable();
      const account = accounts[0];
      const questId = vote[0]._id;
      console.log(vote);

      try {
        if(diff < 0) {
          if(totalVote > 10) {
            console.log('totalVote > 10')
            const bettingKeyQuery = `*[_type == 'questAnswerList' && questKey == ${questKey}]`;
            const bettingKeyList = [];
            await client.fetch(bettingKeyQuery).then((bettings) => {
              bettings.forEach((betting) => {
                console.log(betting)
                bettingKeyList.push(betting.questAnswerKey);
              });
            });
            const receipt = await GovernanceContract().methods.setQuestResult(questKey).send({from : account})
            await client.patch(questId).set({level: 'success'}).commit();
            console.log('test1')
            const publish = await MarketContract().methods.publishMarket(questKey, bettingKeyList).send({from : account});
            console.log('publish', publish)
          // eslint-disable-next-line no-dupe-else-if
          } else if(totalVote > 10 && approveVote === rejectVote) {
            console.log('approveVote = rejectVote')
            const receipt = await GovernanceContract().methods.makeQuestResult(questKey, 'approve').send({from : account})
            console.log(receipt);
          } else {
            console.log('another')
            const receipt = await GovernanceContract().methods.cancelQuest(questKey).send({from : account})
            console.log(receipt);
            await client.patch(questId).set({level: 'cancle'}).commit();
          }
        }
      } catch(err) {
        console.log(err)
      }
    })
  }

  return (
  <div className="bg-quest">
      <div className="dao-container">
        {/* 카테고리 영역 */}
        <div className="dao-category-section">
          <ul>
            {
              categories.map((category, index) => {
                return (
                <li key={index} className={"swiper-slide " + (category.CategoryName === activeCategory ? 'active' : '')} onClick={() => setActiveCategory(category.CategoryName)} style={{cursor:'pointer'}}>
                  {
                    category.CategoryName === 'draft' ? 'Draft' : category.CategoryName === 'success' ? 'Success' : 'Answer'
                  }
                </li>
              )})
            }
          </ul>
        </div>
        {/* 카테고리 영역 끝 */}

        {/* 리스트 시작 */}
        <div className="dao-quest-list-columns">
          {/* Quest 리스트 루프 Start*/}
          <ul className="paginationContent">
          {
            listData && listData.map((list, index) => {
              console.log(list)
              console.log(list.level === activeCategory);
              const questTitle = list.quest.titleKR;
              const category = list.level === 'draft' ? 'Draft' : list.level === 'success' ? 'Success' : 'Answer';

              const endTime = new Date(list.draftEndTime)
              const diff = endTime - nowTime

              // const diffDay = Math.floor(diff / (1000*60*60*24));
              const diffHour = Math.floor((diff / (1000*60*60)) % 24);
              const diffMin = Math.floor((diff / (1000*60)) % 60);
              const diffSec = Math.floor(diff / 1000 % 60);

              // approve / reject 투표수 관리
              const approveVote = !isFinite(Number(list?.approveTotalVote)) ? 0 : Number(list?.approveTotalVote);
              const rejectVote = !isFinite(Number(list?.rejectTotalVote)) ? 0 : Number(list?.rejectTotalVote);
              const totalAmount = approveVote + rejectVote;
              const approvePercent = !isFinite(approveVote / totalAmount) ? '0' : ((approveVote / totalAmount) * 100).toFixed(2);
              const rejectPercent = !isFinite(rejectVote / totalAmount) ? '0' : ((rejectVote / totalAmount) * 100).toFixed(2);

              return (
                // eslint-disable-next-line react/jsx-key
                <>
                  {
                    list.level === activeCategory ? (
                      <li>
                        <h2>
                          {/* 총 투표수 작성 */}
                          <div>
                            {category} <span>{addComma(totalAmount)}</span>
                          </div>
                          <div className='endtime'>
                            {
                              diff >= 0 ? (<div>{diffHour > 9 ? diffHour : '0' + diffHour}:{diffMin > 9 ? diffMin : '0' + diffMin}:{diffSec > 9 ? diffSec : '0' + diffSec}</div>) : (<div className='closed'>Closed</div>)
                            }
                          </div>
                        </h2>
                        <p key={index} 
                        onClick={async () => {
                            let isLogin = false;

                            await checkLogin(walletData).then((res) => {
                              console.log('checkLogin', res);

                              isLogin = res;

                              if(!isLogin) {
                                toastNotify({
                                  state: 'error',
                                  message: 're login or check lock. please',
                                });

                                return;
                              }

                              history.push({pathname: `/Dao/DaoView`, state: {questId: list.quest._id}}) 
                            });
                          }}>
                          <span
                            style={{
                              backgroundImage: `url('${list.quest && (list.quest.imageFile && list.quest.imageFile.asset ? urlFor(list.quest.imageFile) : list.quest.imageUrl)}')`, 
                              backgroundPosition: `center`,
                              backgroundSize: `cover`,
                            }}
                          ></span>
                        </p>
                        <h3>
                          <div>
                            <div>Begins</div> <span>{list.draftStartTime}</span>
                          </div>
                          <div>
                            <div>Ends</div> <span>{list.draftEndTime}</span>
                          </div>
                        </h3>
                        <h4>{questTitle}</h4>
                        <ul>
                          {
                            answerList && answerList.map((answer, index) => {
                              return (
                                <li key={index}>
                                <div>{answer.title}</div>
                                {
                                  answer.title === 'Approve' ?
                                  (
                                    <>
                                      <p>{approveVote}({approvePercent}%)</p>
                                      <h2>
                                        <div style={{ width: `${approvePercent ?? 0}%` }}></div>
                                      </h2>
                                    </>
                                  ) :
                                  (
                                    <>
                                    <p>{rejectVote}({rejectPercent}%)</p>
                                      <h2>
                                        <div style={{ width: `${rejectPercent ?? 0}%` }}></div>
                                      </h2>
                                    </>
                                  )
                                }
                              </li>
                              )
                            })
                          }
                        </ul>
                        <div className='selectBtn'>
                          <div>Would you like to vote for the Quest Draft?</div>
                          <div>
                            <button
                              onClick={() => {
                                if(diff < 0) {
                                  toastNotify({
                                    state: 'error',
                                    message: 'The Draft Quest Is Closed.',
                                  });
                                } else {
                                  DraftVoteGovernance(list.quest.questKey, 'approve', list.quest._id)
                                }
                              }}
                              className={
                                diff < 0 && approveVote > rejectVote ? 'winnerBtn' : ''
                              }
                            >
                              Approve {adminAddressDB === newAccount ? (<span>({approveVote})</span>) : (null)}
                            </button>
                            <button 
                              onClick={() => {
                                if(diff < 0) {
                                  toastNotify({
                                    state: 'error',
                                    message: 'The Draft Quest Is Closed.',
                                  });
                                } else {
                                  DraftVoteGovernance(list.quest.questKey, 'reject', list.quest._id)
                                }
                              }}
                              className={diff < 0 && approveVote < rejectVote ? 'winnerBtn' : ''}
                            >
                              Reject {adminAddressDB === newAccount ? (<span>({rejectVote})</span>) : (null)}
                            </button>
                          </div>
                          {
                            adminAddressDB === newAccount && diff < 0 ?
                            (
                              <button
                                onClick={() => DraftResultHandler(list.quest._id)}
                                className="adminConfirmBtn">Confirm</button>
                            )
                            :
                            (
                              null
                            )
                          }
                        </div>
                      </li>
                    ) : (null)
                  }
                </>
              );
            })
          }
          {/* Quest 리스트 루프 End */}
          </ul>
        </div>
        {/* 리스트 끝 */}
      </div>
    </div>
  )
}

function addComma(data) {
  if(!data) return 0;

	return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default Index;
