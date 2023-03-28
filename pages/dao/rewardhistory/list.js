import React, { useState, useEffect, useRef } from "react";

import "react-datepicker/dist/react-datepicker.css";

import { urlFor, client } from "../../../sanity";
import { useLoadingState } from "@assets/context/LoadingContext";
import { GovernanceContract } from "../contractHelper";

import toastNotify from '@utils/toast';

import { lastElementsForPage } from '../../../studio/src/maker';
import { callRewardQuery, callRewardListQuery } from "./sanityQuery/useQuery";

function Index() {

  const { loading, setLoading } = useLoadingState();

  const [ dataList, setDataList ] = useState([]);
  const [ newAccount, setNewAccount ] = useState(window?.klaytn?.selectedAddress?.toLowerCase());
  const [ network, setNetwork ] = useState(window?.klaytn?.networkVersion);
  const [ checkList, setCheckList ] = useState([]);
  const [ checkedAll, setCheckedAll ] = useState(false);
  const [ render, setRender ] = useState(false);
  const [ notData, setNotData ] = useState(false);

  // klaytn Account Change 감지
  window.klaytn.on('accountsChanged', (accounts) => {
    setNewAccount(accounts[0]);
  });

  window?.klaytn.on('networkChanged', (networkVer) => {
    setNetwork(networkVer)
  });
  
  useEffect(async () => {
    await callRewardQuery(setDataList, setLoading, setNotData)
  }, [newAccount, network, render])

  const totalCount = dataList.length;
  const rewardTotalCount = dataList.filter(reward => reward.archive && !reward.rewardStatus).length;
  const [activateDelete, setActivateDelete] = useState(false);

  const activateDeleteHandler = () => {
    activateDelete ? setActivateDelete(false) : setActivateDelete(true);
  }

  const getRewardHandler = async (list, maxResult) => {
    setLoading(true)

    if(list.answerOption !== maxResult.title) {
      toastNotify({
        state: 'error',
        message: `Failed to guess the correct answer.`,
      });
      setLoading(false);
      return;
    }

    if(list.rewardStatus) {
      toastNotify({
        state: 'error',
        message: `This quest has already been rewarded.`,
      });
      setLoading(false);
      return;
    }

    const questKey = list.governanceItem[0].quest.questKey;
    let answerKey

    if(list.answerOption === maxResult.title) {
      answerKey = maxResult.questAnswerKey;
    }

    try {
      const receipt = await GovernanceContract().methods.distributeDaoReward(questKey, answerKey).send({from: newAccount, gas: 500000});
      if(receipt.status === true) {
        await client.patch(list._id).set({rewardStatus: true}).commit();
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
          if(!data) return;
          return idArray.push(data?._id);
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
      setActivateDelete(false);
      toastNotify({
        state: 'success',
        message: `The selected reward history has been deleted.`,
      });
    }
    setLoading(false);
  }

  const singleCheckHandler = (_id) => {
    if(checkList.includes(_id)) {
      setCheckedAll(false);
      setCheckList(checkList.filter((el) => el !== _id))
    } else {
      setCheckedAll(false);
      setCheckList([...checkList, _id]);
    }
  }

  const obsRef = useRef(null) // observer Element
  const [page, setPage] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(obsHandler, { threshold: 0.6 });
    if (obsRef.current) observer.observe(obsRef.current);
    return () => {
      observer.disconnect();
    }
  }, []);

  const obsHandler = async (entries) => {
    const target = entries[0];
		if (target.isIntersecting) {
			setPage(prev => prev + 1);
		}
  }

  const getQuestList = async () => {
    const {lastValue, lastId} = lastElementsForPage(dataList, `_updatedAt`)
		await callRewardListQuery(setDataList, setLoading, setNotData, lastValue, lastId)
    return;
  }

	useEffect(() => {
    if(!notData && dataList.length !== 0) {
      getQuestList()
    }
  }, [page])
  
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
                  const maxResult = list.governanceItem[0].quest.answerId.filter((answer, idx, target) => {
                    const maxOfVote = Math.max(...target.map(vote => vote.totalVotes));
                    return answer.totalVotes === maxOfVote;
                  })

                  const endTime = list.governanceItem[0].answerEndTime.split(' ');
                  const rewardNFT = list.answerCount ?? 0;
                  const rewardStatus = list.rewardStatus;
                  const getCT = ((list.governanceItem[0].reward * rewardNFT) / maxResult[0].totalVotes).toFixed(2)
                  return (
                    <li key={idx} >
                      {
                        activateDelete ? (
                          <input
                            type="checkbox"
                            id={list.title}
                            name={list.title}
                            checked={checkList.includes(list._id) ? true : false}
                            onChange={(e) => singleCheckHandler(e)}
                          />
                        ) : (null)
                      }
                      <label
                        onClick={
                          () => {
                            if(!activateDelete) {
                              getRewardHandler(list, maxResult[0])
                            } else {
                              singleCheckHandler(list._id)
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
                            <span className={maxResult[0].title !== list.answerOption ? 'rewardFail' : rewardStatus ? 'rewardFinish': 'rewardGet'}>
                              {
                                maxResult[0].title !== list.answerOption ? (
                                  <span>FAIL</span>
                                ) : rewardStatus ? (
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
                                backgroundImage: `url('${list.governanceItem[0].quest && (list.governanceItem[0].quest.imageFile && list.governanceItem[0].quest.imageFile.asset ? urlFor(list.governanceItem[0].quest.imageFile) : list.governanceItem[0].quest.imageUrl)}')`,
                                backgroundPosition: `center`,
                                backgroundSize: `cover`,
                              }}></span>
                            <div>
                              <p>{list.governanceItem[0].quest.titleKR}</p>
                              <p>{endTime[0]}</p>
                            </div>
                          </div>
                        </div>
                      </label>
                    </li>
                  )
                })
              }
            </ul>
          {/* Proposal 리스트 루프 End */}
          </ul>
          <div ref={obsRef} style={{width: '100%', height: '1px', display: `${notData ? 'none' : 'block'}`}}></div>
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
