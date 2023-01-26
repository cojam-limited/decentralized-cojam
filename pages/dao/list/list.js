import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import Moment from 'moment';

import "react-datepicker/dist/react-datepicker.css";

import { urlFor, client } from "../../../sanity";
import { useLoadingState } from "@assets/context/LoadingContext";
import Pagination from "react-sanity-pagination";

import "react-responsive-modal/styles.css";
import { useWalletData } from '@data/wallet';
import { checkLogin } from "@api/UseTransactions";

import toastNotify from '@utils/toast';
import Caver from "caver-js";
import GovernanceContractABI from "../../../api/ABI/GovernanceContractABI.json"
import Web3 from "web3";

function Index() {
  const { walletData } = useWalletData();

  const { setLoading } = useLoadingState();
  const history = useHistory();

  const [ listData, setListData ] = useState([]);
  const [ voteList, setVoteList ] = useState([]);
  const [ activeCategory, setActiveCategory ] = useState('draft');
  const [ nowTime, setNowTime ] = useState(new Date());
  // setInterval(() => {
  //   setNowTime(new Date())
  // }, 1000)

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
  const governanceAddress = process.env.REACT_APP_GOVERNANCE_ADDRESS;

  useEffect(() => {
    setLoading(true);
    
    /**
     * GovernanceItem list 조회
     */
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

  // // 블록체인에 Quest 등록
  const GovernanceContract = () => {
    return new web3.eth.Contract(GovernanceContractABI, governanceAddress) 
  }

  const DraftVoteGovernance = async (questKey, answer, _id) => {
    const accounts = await window.klaytn.enable()
    const account = accounts[0];
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

      // update quest total amount
      const newQuestTotalQuery = `*[_type == 'governanceItem' && references('${_id}')]`;
      await client.fetch(newQuestTotalQuery).then(async (vote) => {
        const questId = vote[0]._id;
        const draftTotal = vote[0].draftTotalVote;

        const newDraftTotal = draftTotal + returnValue.votedNfts.length;

        await client.patch(questId).set({draftTotalVote: newDraftTotal}).commit();
        setLoading(false);
      });
    } catch (error) {
      console.error('DraftVoteGovernance', error);
      setLoading(false);
    }
  };

	// pagenation settings
	let postsPerPage = 6;
	const [ items, setItems ] = useState([]);
	const [ itemsToSend, setItemsToSend ] = useState([]);

  const action = (page, range, items) => {
		setItems(items);
	};
	// pagenation settings

  const [ answerTotalAmounts, setAnswerTotalAmounts] = useState({});
  const [ answerPercents, setAnswerPercents] = useState({});
  const [ answerAllocations, setAnswerAllocations ] = useState({});

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
              // const list_id = list?.questKey?._ref

              // const votelistQuery = `*[_type == 'governanceItemVote']`
              // client.fetch(votelistQuery).then((votelist) => {
              //   setVoteList(votelist);
              // })

              const endTime = new Date(list.draftEndTime)
              const diff = endTime - nowTime

              // const diffDay = Math.floor(diff / (1000*60*60*24));
              const diffHour = Math.floor((diff / (1000*60*60)) % 24);
              const diffMin = Math.floor((diff / (1000*60)) % 60);
              const diffSec = Math.floor(diff / 1000 % 60);

              return (
                // eslint-disable-next-line react/jsx-key
                <li>
                  <h2>
                    {/* 총 투표수 작성 */}
                    <div>
                      {category} <span>{list.draftTotalVote && addComma(list.draftTotalVote)}</span>
                    </div>
                    <div className='endtime'>
                      {
                        diff >= 0 ? (<div>{diffHour > 10 ? diffHour : '0' + diffHour}:{diffMin > 10 ? diffMin : '0' + diffMin}:{diffSec > 10 ? diffSec : '0' + diffSec}</div>) : (<div className='closed'>Closed</div>)
                      }
                    </div>
                  </h2>
                  <p key={index} 
                  onClick={async () => {
                      if(list.quest.dDay === 'expired' || list.quest.dDay === 'pending') {
                        toastNotify({
                          state: 'error',
                          message: 'the quest is closed. (expired or pending)',
                        });
                        return;
                      }

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
                          <p>{answerAllocations[answer._id] && answerAllocations[answer._id] !== '0%' ? `${answerAllocations[answer._id] || 0} X` : '0%'} </p>
                          <h2>
                            <div style={{ width: `${answerPercents[answer._id] ?? 0}%` }}></div>
                          </h2>
                        </li>
                        )
                      })
                    }
                  </ul>
                  <div className='selectBtn'>
                    <div>Would you like to vote for the Quest Draft?</div>
                    <div>
                      <button
                        onClick={() => {DraftVoteGovernance(list.quest.questKey, 'approve', list.quest._id)}}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => {DraftVoteGovernance(list.quest.questKey, 'reject', list.quest._id)}}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </li>
              );
            })
          }
          {/* Quest 리스트 루프 End */}
          </ul>
        </div>
        {/* 리스트 끝 */}

        {/* 페이지네이션 */}
				{
          itemsToSend.length > 0 && 
          <Pagination
						nextButton={true}
						prevButton={true}
						nextButtonLabel={">"}
						prevButtonLabel={"<"}
						items={itemsToSend}
						action={action}
						postsPerPage={postsPerPage}
				  />
        }
				{/* 페이지네이션 끝 */}
      </div>
    </div>
  )
}

function addComma(data) {
  if(!data) return 0;

	return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default Index;
