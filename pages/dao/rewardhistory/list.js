import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import Moment from 'moment';

import "react-datepicker/dist/react-datepicker.css";

import { urlFor, client } from "../../../sanity";
import { useLoadingState } from "@assets/context/LoadingContext";
import Pagination from "react-sanity-pagination";
import { GovernanceContract } from "../contractHelper";

import toastNotify from '@utils/toast';

function Index() {

  const { setLoading } = useLoadingState();
  const history = useHistory();

  const [ dataList, setDataList ] = useState([]);
  const [ newAccount, setNewAccount ] = useState(window?.klaytn?.selectedAddress?.toLowerCase());
  const [ checkList, setCheckList ] = useState([]);
  const [ checkedAll, setCheckedAll ] = useState(false);
  const [ render, setRender ] = useState(false);

	// pagenation settings
	let postsPerPage = 6;
	const [ items, setItems ] = useState([]);
	const [ itemsToSend, setItemsToSend ] = useState([]);

  const action = (page, range, items) => {
		setItems(items);
	};

  // klaytn Account Change 감지
  window.klaytn.on('accountsChanged', (accounts) => {
    setNewAccount(accounts[0]);
  });
  
  useEffect(async () => {
    setLoading(true);

    `*[_type == 'quests' && isActive == true  && (statusType == 'SUCCESS' || statusType == 'ADJOURN') && _id != '${Date.now()}'] {..., 'now': now(), 'categoryNm': *[_type=='seasonCategories' && _id == ^.seasonCategory._ref]{seasonCategoryName}[0], 'answerIds': *[_type=='questAnswerList' && questKey == ^.questKey] {title, _id, totalAmount}} | order(createdDateTime desc)`;

    const rewardHistoryQuery = `*[_type == 'governanceItem' && level == 'done' && _id != '${Date.now()}']
    {
      ...,
      'quest': *[_type == 'quests' && _id == ^.questKey._ref && _id != '${Date.now()}'][0]
      {
        ...,
        'answerId': *[_type == 'questAnswerList' && questKey == ^.questKey && _id != '${Date.now()}'] {title, _id, totalVotes, questAnswerKey},
        'votingList': *[_type == 'governanceItemVote' && governanceItemId == ^._id && voter == '${newAccount}' && _id != '${Date.now()}']
      },
    }`;
    await client.fetch(rewardHistoryQuery).then((rewardHistory) => {
      setDataList(rewardHistory)
      setLoading(false);
    })
  }, [newAccount, render])

  const totalCount = dataList.filter(reward => reward.quest.votingList.length > 0 && reward.quest.votingList[0].answerCount && reward.quest.votingList[0].archive).length;
  const rewardTotalCount = dataList.filter(reward => reward.level === 'done' && reward.quest.votingList.length > 0 && reward.quest.votingList[0].answerCount && reward.quest.votingList[0].archive).length;
  const [activateDelete, setActivateDelete] = useState(false);

  const activateDeleteHandler = () => {
    activateDelete ? setActivateDelete(false) : setActivateDelete(true);
  }

  const getRewardHandler = async (list) => {
    setLoading(true)

    if(list.quest.votingList[0].rewardStatus) {
      toastNotify({
        state: 'error',
        message: `This quest has already been rewarded.`,
      });
      setLoading(false);
      return;
    }

    const questKey = list.quest.questKey;
    let answerKey

    list.quest.answerId.map((answer) => {
      if(answer.title === list.quest.votingList[0].answerOption) {
        answerKey = answer.questAnswerKey;
      }
    })

    try {
      const receipt = await GovernanceContract().methods.distributeDaoReward(questKey, answerKey).send({from: newAccount, gas: 500000});
      console.log(receipt);
      if(receipt.status === true) {
        await client.patch(list.quest.votingList[0]._id).set({rewardStatus: true}).commit();
        toastNotify({
          state: 'success',
          message: `Success to receive reward.`,
        });
      } else {
        toastNotify({
          state: 'error',
          message: `Failed to receive reward.`,
        });
      }
      setRender(!render)
      setLoading(false)
    } catch (err) {
      console.error(err);
      toastNotify({
        state: 'error',
        message: `Failed to receive reward.`,
      });
      setLoading(false)
    }
    
  }

  const RewardFooterHandler = (status) => {
    setLoading(true);
    if(status === 'select') {
      if(!checkedAll) {
        console.log(dataList)
        const idArray = [];
        dataList.forEach((data) => idArray.push(data.quest.votingList[0]._id))
        setCheckedAll(true);
        setCheckList(idArray);
      } else {
        setCheckedAll(false);
        setCheckList([]);
      }
    } else if(status === 'cancel') {
      setCheckedAll(false);
      setCheckList([]);
      setActivateDelete(false);
    } else if(status === 'delete') {
      checkList.map(async (itemId) => {
        await client.patch(itemId).set({archive: false}).commit();
      })
      setRender(!render);
      toastNotify({
        state: 'success',
        message: `The selected reward history has been deleted.`,
      });
    }
    setLoading(false);
  }

  const singleCheckHandler = (_id) => {
    console.log(_id);
    if(checkList.includes(_id)) {
      setCheckedAll(false);
      setCheckList(checkList.filter((el) => el !== _id))
    } else {
      setCheckedAll(false);
      setCheckList([...checkList, _id]);
    }
  }
  
  return (
    <div className="bg-quest">
      <div className="dao-container proposal">
        {/* 카테고리 영역 */}
        <div className="reward-history-section">
          <div>
            <p>Total Reward <span>{rewardTotalCount}/{totalCount}</span></p>
            <button
              onClick={activateDeleteHandler}
            >
              {
                activateDelete ? 'Cancel' : 'Delete'
              }
            </button>
          </div>
        </div>
        {/* 카테고리 영역 끝 */}

        {/* 리스트 시작 */}
        <div className="reward-history-list">
          {/* Proposal 리스트 루프 Start */}
          <ul className="paginationContent">
            <ul className='reward-history-content'>
              {
                dataList.map((list, idx) => {
                  const votingList = list.quest.votingList
                  if(votingList.length > 0 && votingList[0].answerCount && votingList[0].archive) {
                    console.log(list);
                    const endTime = list.answerEndTime.split(' ');
                    const rewardNFT = votingList[0].answerCount ?? 0;
                    return (
                      <li key={idx} >
                        {
                          activateDelete ? (
                            <input
                              type="checkbox"
                              id={list.title}
                              name={list.title}
                              checked={checkList.includes(votingList[0]._id) ? true : false}
                              onChange={(e) => singleCheckHandler(e)}
                            />
                          ) : (null)
                        }
                        <label
                          onClick={
                            () => {
                              if(!activateDelete) {
                                getRewardHandler(list)
                              } else {
                                singleCheckHandler(votingList[0]._id)
                              }
                            }
                          }
                          htmlFor={list.title}
                          className={`${activateDelete ? 'activate' : ''}`}
                        >
                          {
                            activateDelete ? (
                              <span className="checkbox"></span>
                            ) : (null)
                          }
                          <div>
                            <h3>
                              Reward {rewardNFT} NFT
                            </h3>
                            <div>
                              <span
                                style={{
                                  backgroundImage: `url('${list.quest && (list.quest.imageFile && list.quest.imageFile.asset ? urlFor(list.quest.imageFile) : list.quest.imageUrl)}')`, 
                                  backgroundPosition: `center`,
                                  backgroundSize: `cover`,
                                }}></span>
                              <div>
                                <p>{list.quest.titleKR}</p>
                                <p>{endTime[0]}</p>
                              </div>
                            </div>
                          </div>
                        </label>
                      </li>
                    )
                  }
                })
              }
            </ul>
          {/* Proposal 리스트 루프 End */}
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

        {/* Proposal-footer Start */}
        {
          activateDelete ? (
            <div className='reward-history-footer'>
              <p onClick={() => {RewardFooterHandler('select')}}>Select All</p>
              <p onClick={() => {RewardFooterHandler('cancel')}}>Cancel</p>
              <p onClick={() => {RewardFooterHandler('delete')}}>Delete</p>
            </div>
          )
          :
          (null)
        }
        {/* Proposal-footer End */}
      </div>
    </div>
  )
}

function addComma(data) {
  if(!data) return 0;

	return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default Index;
