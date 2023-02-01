import React, { useState, useEffect, useMemo } from "react";
import { useHistory } from "react-router-dom";

import "react-datepicker/dist/react-datepicker.css";

import { urlFor, client } from "../../../sanity";
import { useLoadingState } from "@assets/context/LoadingContext";

import Moment from 'moment';

import "react-responsive-modal/styles.css";
import { useWalletData } from '@data/wallet';
import { checkLogin } from "@api/UseTransactions";

import toastNotify from '@utils/toast';

import { NftContract, MarketContract, GovernanceContract } from "../contractHelper";

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
    {title: 'Approve', level: 'draft'},
    {title: 'Reject', level: 'draft'},
    {title: 'Success', level: 'success'},
    {title: 'Adjourn', level: 'success'},
  ];

  const amdinContractAddress = process.env.REACT_APP_ADMIN_ADDRESS;

  // klaytn Account Change 감지
  window.klaytn.on('accountsChanged', (accounts) => {
    setNewAccount(accounts[0]);
  });

  useEffect(() => {
    setLoading(true);
    // GovernanceItem list 조회
    const governanceVoteQuery = `*[_type == 'governanceItem']
    {
      ...,
      'quest': *[_type == 'quests' && _id == ^.questKey._ref][0]
    }`;
    client.fetch(governanceVoteQuery).then((governanceItem) => {
      setListData(governanceItem);
      setLoading(false);
    })    
  }, [activeCategory, newAccount])

  useEffect(() => {
    const AdminAddressQuery = `*[_type == 'admin' && active == true]`
    client.fetch(AdminAddressQuery).then((adminlist) => {
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

  const DraftVoteGovernance = async (diff, level, questKey, answer, _id) => {
    const accounts = await window.klaytn.enable()
    const account = accounts[0];
    const balance = await NftContract().methods.balanceOf(account).call();

    if(diff < 0) {
      toastNotify({
        state: 'error',
        message: `The ${level} Quest Is Closed.`,
      });
      return;
    }

    if(Number(balance) <= 0) {
      toastNotify({
        state: 'error',
        message: 'You Need Membership NFT',
      })
      return;
    }

    setLoading(true);

    try {
      if(level === 'draft') {
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
          const balance = await NftContract().methods.balanceOf(account).call();
  
          if(answer === 'approve') {
            const newDraftApproveTotal = draftApproveTotal + returnValue.votedNfts.length;
            await client.patch(questId).set({approveTotalVote: newDraftApproveTotal}).commit();
            toastNotify({
              state: 'success',
              message: `${balance} Votes to Approve this Quest.`,
            });
          } else if(answer === 'reject') {
            const newDraftRejectTotal = draftRejectTotal + returnValue.votedNfts.length;
            await client.patch(questId).set({rejectTotalVote: newDraftRejectTotal}).commit();
            toastNotify({
              state: 'success',
              message: `${balance} Votes to Reject this Quest.`,
            });
          }
        });
      } else if (level === 'success') {
        const receipt = await GovernanceContract().methods.voteDecision(questKey, answer).send({from : account})
        const returnValue = receipt?.events?.VoteDecisionCast?.returnValues;
        const SuccessAnswerQuery = `*[_type == 'governanceItemVote' && governanceItemId == '${_id}' && voter == '${account.toLowerCase()}']`;
        await client.fetch(SuccessAnswerQuery).then(async (list) => {
          console.log(list)
          await client.patch(list[0]._id).set(
            {
              successOption: returnValue.answer,
              successCount: returnValue.votedNfts.length,
              successTxHash: returnValue.transactionHash,
            }
          ).commit();
        })

        // update draft total amount
        const SuccessTotalQuery = `*[_type == 'governanceItem' && references('${_id}')]`;
        await client.fetch(SuccessTotalQuery).then(async (vote) => {
          const questId = vote[0]._id;
          const successTotal = vote[0].successTotalVote;
          const adjournTotal = vote[0].adjournTotalVote;
          const balance = await NftContract().methods.balanceOf(account).call();
  
          if(answer === 'success') {
            const newSuccessTotal = successTotal + 5;
            await client.patch(questId).set({successTotalVote: newSuccessTotal}).commit();
            toastNotify({
              state: 'success',
              message: `${balance} Votes to Success this Quest.`,
            });
          } else if(answer === 'adjourn') {
            const newAdjournTotal = adjournTotal + 5;
            await client.patch(questId).set({adjournTotalVote: newAdjournTotal}).commit();
            toastNotify({
              state: 'success',
              message: `${balance} Votes to Adjourn this Quest.`,
            });
          }
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('DraftVoteGovernance', error);
      setLoading(false);
      toastNotify({
        state: 'error',
        message: 'Check Your Wallet Account',
      });
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

      const marketKey = vote[0].questKey.questKey;
      const creator = vote[0].questKey.creatorAddress;
      const title = vote[0].questKey.titleKR;
      const creatorFee = Number(vote[0].questKey.creatorPay) / 10 ** 18;
      const creatorFeePercentage = vote[0].questKey.creatorFee;
      const cojamFeePercentage = vote[0].questKey.cojamFee;
      const charityFeePercentage = vote[0].questKey.charityFee;

      try {
        if(diff < 0) {
          if(totalVote >= 10) {
            console.log('totalVote > 10')
            if(approveVote > rejectVote) {
              const answerKeyQuery = `*[_type == 'questAnswerList' && questKey == ${questKey}]`;
              const answerKeyList = [];
              await client.fetch(answerKeyQuery).then((answers) => {
                console.log(answers);
                answers.forEach((answer) => {
                  console.log(answer)
                  answerKeyList.push(answer.questAnswerKey);
                });
              });

              const receipt = await GovernanceContract().methods.setQuestResult(questKey).send({from : account, gas: 500000})
              console.log('setQuest', receipt);
              await client.patch(questId).set({level: 'draftEnd'}).commit();
              // // if(receipt.events.QuestResult.returnValues.result === 'approve')
              console.log(receipt)

              const publish = await MarketContract().methods.publishMarket(
                marketKey,
                creator,
                title,
                creatorFee,
                creatorFeePercentage,
                cojamFeePercentage,
                charityFeePercentage,
                answerKeyList
              ).send({from : account, gas: 500000});
              console.log('publish', publish)
              const approveListQuery = `*[_type == 'quests' && _id == '${vote[0].questKey._id}']`
              client.fetch(approveListQuery).then(async (list) => {
                console.log(list);
                await client.patch(list[0]._id).set({
                  statusType: 'APPROVE',
                  questStatus: 'APPROVE',
                  approveTx: publish.transactionHash,
                  approveDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                  updateMember: account,
                }).commit();
              })
            }
          // eslint-disable-next-line no-dupe-else-if
          } else if(totalVote >= 10 && approveVote === rejectVote) {
            console.log('approveVote = rejectVote')
            const receipt = await GovernanceContract().methods.makeQuestResult(questKey, 'approve').send({from : account})
            console.log(receipt);
          } else {
            console.log('another')
            const receipt = await GovernanceContract().methods.cancelQuest(questKey).send({from : account})
            console.log(receipt);
            await client.patch(questId).set({level: 'cancel'}).commit();
          }
        }
      } catch(err) {
        console.log(err)
      }
    })
  }

  const setQuestEndTime = async (questKey, questId) => {
    const accounts = await window.klaytn.enable();
    const account = accounts[0];
    const receipt = await GovernanceContract().methods.setQuestEndTime(questKey).send({from : account})
    console.log(receipt)
    const endQuestQuery = `*[_type == 'governanceItem' && references('${questId}')]`
    client.fetch(endQuestQuery).then(async (list) => {
      await client.patch(list[0]._id).set({draftEndTime: Moment().format("yyyy-MM-DD HH:mm:ss")}).commit();
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
              const questTitle = list.quest.titleKR;
              const category = list.level === 'draft' ? 'Draft' : list.level === 'success' ? 'Success' : 'Answer';

              const endTime = category === 'Draft' ? new Date(list.draftEndTime) : category === 'Success' ? new Date(list.successEndTime) : new Date(list.answerEndTime);
              const diff = endTime - nowTime

              const diffHour = Math.floor((diff / (1000*60*60)) % 24);
              const diffMin = Math.floor((diff / (1000*60)) % 60);
              const diffSec = Math.floor(diff / 1000 % 60);

              const beginsTime = category === 'Draft' ? list.draftStartTime : category === 'Success' ? list.successStartTime : list.answerStartTime;
              const endsTime = category === 'Draft' ? list.draftEndTime : category === 'Success' ? list.successEndTime : list.answerEndTime;

              // draft / success 투표수 관리
              let agreeVote
              let disagreeVote
              if(category === 'Draft') {
                agreeVote = !isFinite(Number(list?.approveTotalVote)) ? 0 : Number(list?.approveTotalVote);
                disagreeVote = !isFinite(Number(list?.rejectTotalVote)) ? 0 : Number(list?.rejectTotalVote);
              } else if(category === 'Success') {
                agreeVote = !isFinite(Number(list?.successTotalVote)) ? 0 : Number(list?.successTotalVote);
                disagreeVote = !isFinite(Number(list?.adjournTotalVote)) ? 0 : Number(list?.adjournTotalVote);
              }
              const totalAmount = agreeVote + disagreeVote;
              const agreePer = !isFinite(agreeVote / totalAmount) ? '0' : ((agreeVote / totalAmount) * 100).toFixed(2);
              const disagreePer = !isFinite(disagreeVote / totalAmount) ? '0' : ((disagreeVote / totalAmount) * 100).toFixed(2);

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
                            <div>Begins</div> <span>{beginsTime}</span>
                          </div>
                          <div>
                            <div>Ends</div> <span>{endsTime}</span>
                          </div>
                        </h3>
                        <h4>{questTitle}</h4>
                        <ul>
                          {answerList && answerList.map((answer, index) => {
                              if(list.level === answer.level) {
                                return (
                                  <li key={index}>
                                    <div>{answer.title}</div>
                                    <p>
                                      {answer.title === ('Approve' || 'Success') ? agreeVote : disagreeVote}({answer.title === ('Approve' || 'Success') ? agreePer : disagreePer}%)
                                    </p>
                                    <h2>
                                      <div style={{ width: `${answer.title === ('Approve' || 'Success') ? agreePer : disagreePer ?? 0}%` }}></div>
                                    </h2>
                                  </li>
                                )
                              }
                            })}
                        </ul>
                        <div className='selectBtn'>
                          <div>Would you like to vote for the Quest {category}?</div>
                          <div>
                          {
                            answerList && answerList.map((answer, index) => {
                              if(answer.level === list.level) {
                                return (
                                  <button
                                    key={index}
                                    onClick={() => {DraftVoteGovernance(diff, list.level, list.quest.questKey, answer.title.toLowerCase(), list.quest._id)}}
                                    // className={
                                    //   diff < 0 && approveVote > rejectVote ? 'appwinBtn' :
                                    //   diff < 0 && approveVote < rejectVote ? 'rejwinBtn' : ''
                                    // }
                                  >
                                    {answer.title}
                                    {
                                      adminAddressDB === newAccount ? 
                                      (
                                        <span>({answer.title === ('Approve' || 'Success') ? agreeVote : disagreeVote})</span>
                                      ) : (null)
                                    }
                                  </button>
                                )
                              }
                            })
                          }
                            <button onClick={() => setQuestEndTime(list.quest.questKey, list.quest._id)}>End</button>
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
