import React, { useState, useEffect } from "react";

import "react-datepicker/dist/react-datepicker.css";

import { urlFor, client } from "../../../sanity";
import { useLoadingState } from "@assets/context/LoadingContext";
import { GovernanceContract } from "../contractHelper";

import toastNotify from '@utils/toast';

function Index() {

  const { loading, setLoading } = useLoadingState();

  const [ dataList, setDataList ] = useState([]);
  const [ newAccount, setNewAccount ] = useState(window?.klaytn?.selectedAddress?.toLowerCase());
  const [ network, setNetwork ] = useState(window?.klaytn?.networkVersion);
  const [ checkList, setCheckList ] = useState([]);
  const [ checkedAll, setCheckedAll ] = useState(false);
  const [ render, setRender ] = useState(false);

  // klaytn Account Change 감지
  window.klaytn.on('accountsChanged', (accounts) => {
    setNewAccount(accounts[0]);
  });

  window?.klaytn.on('networkChanged', (networkVer) => {
    setNetwork(networkVer)
  });
  
  useEffect(async () => {
    setLoading(true);

    const rewardHistoryQuery = `*[_type == 'governanceItem' && level == 'done' && reward != null && _id != '${Date.now()}']
    {
      ...,
      'quest': *[_type == 'quests' && _id == ^.questKey._ref && _id != '${Date.now()}'][0]
      {
        ...,
        'answerId': *[_type == 'questAnswerList' && questKey == ^.questKey && _id != '${Date.now()}'] {title, _id, totalVotes, questAnswerKey},
        'votingList': *[_type == 'governanceItemVote' && governanceItemId == ^._id && archive == true && voter == '${newAccount}' && _id != '${Date.now()}']
      },
    }`;
    await client.fetch(rewardHistoryQuery).then((rewardHistory) => {
      setDataList(rewardHistory)
      setLoading(false);
    })
  }, [newAccount, network, render])

  const totalCount = dataList.filter(reward => reward.quest.votingList.length > 0 && reward.quest.votingList[0].answerCount && reward.quest.votingList[0].archive).length;
  const rewardTotalCount = dataList.filter(reward => reward.level === 'done' && reward.quest.votingList.length > 0 && reward.quest.votingList[0].answerCount && reward.quest.votingList[0].archive && !reward.quest.votingList[0].rewardStatus).length;
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
        const idArray = [];
        dataList.forEach((data) => {
          if(!data.quest.votingList[0]) return;
          return idArray.push(data?.quest?.votingList[0]?._id);
        })
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
        setRender(!render);
      })
      setCheckedAll(false);
      setCheckList([]);
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
      <div className="dao-container reward">
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
            {
              loading && dataList.length === 0 ? (
                <div className='wait-list'>
                  <h2>Wait Loading List...</h2>
                </div>
              ) : null
            }
            {
              !loading && dataList.length === 0 ? (
                <div className='not-list-data'>
                  <h2>
                    No Rwards Exist.
                  </h2>
                </div>
              ) : (null)
            }
            <ul className='reward-history-content'>
              {
                dataList.map((list, idx) => {
                  const votingList = list.quest.votingList
                  if(votingList.length > 0 && votingList[0].answerCount && votingList[0].archive) {
                    const endTime = list.answerEndTime.split(' ');
                    const rewardNFT = votingList[0].answerCount ?? 0;
                    const rewardStatus = votingList[0].rewardStatus;
                    const getCT = ((list.reward * rewardNFT) / list.answerTotalVote).toFixed(2)
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
                              <span className={rewardStatus ? 'rewardFinish': 'rewardGet'}>
                                {
                                  rewardStatus ? (
                                    <span>FINISH</span>
                                  ) : (
                                    <span>GET <span className='checkCT'>{getCT}</span> CT</span>
                                  )
                                }
                              </span>
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

export default Index;
