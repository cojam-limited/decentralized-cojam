import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";

import "react-datepicker/dist/react-datepicker.css";

import { urlFor } from "../../../sanity";
import { useLoadingState } from "@assets/context/LoadingContext";

import "react-responsive-modal/styles.css";
import { useWalletData } from '@data/wallet';
import { checkLogin } from "@api/UseTransactions";

import toastNotify from '@utils/toast';
import { Icon } from '@iconify/react';

import { voteGovernance } from "../list/useVoteGovernance"
import { resultGovernance, resultModalHandler, cancelModalHandler } from "../list/useResultGovernance"
import { questEndTime } from "../list/useQuestEndTime"
import { answerConfirm } from "../list/useAnswerConfirm"
import { makeConfirm } from "../list/useMakeConfirm"
import { cancelConfirm } from "../list/useCancelConfirm"
import { voteCount } from "./useVoteCount";
import { callQuestQuery, callQuestListQuery, callAdminQuery } from "../list/sanityQuery/useQuery"
import { lastElementsForPage } from "../../../studio/src/maker"

function Index() {
  const { walletData } = useWalletData();

  const { loading, setLoading } = useLoadingState();
  const history = useHistory();

  const [ listData, setListData ] = useState([]);
  const [ activeCategory, setActiveCategory ] = useState('draft');
  const [ nowTime, setNowTime ] = useState(new Date());
  const [ newAccount, setNewAccount ] = useState(window?.klaytn?.selectedAddress?.toLowerCase());
  const [ network, setNetwork ] = useState(window?.klaytn?.networkVersion)
  const [ adminAddressDB, setAdminAddressDB ] = useState('');
  const [ render, setRender ] = useState(false);
  const [ selectedAnswer, setSelectedAnswer] = useState();
  const [ makeSelect, setMakeSelect ] = useState(false);
  const [ selectLevel, setSelectLevel ] = useState('');
  const [ notData, setNotData ] = useState(false);
  const [ voteMinOrMax, setVoteMinOrMax ] = useState({});
  const [ draftModal, setDraftModal ] = useState(false);
  // useEffect(async () => {
  //   setInterval(() => {
  //     setNowTime(new Date())
  //   }, 1000)
  // }, [])

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

  // klaytn Account Change 감지
  window.klaytn.on('accountsChanged', (accounts) => {
    setNewAccount(accounts[0]);
  });

  window?.klaytn.on('networkChanged', (networkVer) => {
    setNetwork(networkVer)
  });

  useEffect(async () => {
    // GovernanceItem list 조회
    callQuestQuery(setListData, setLoading, activeCategory, setNotData)
    const vote = await voteCount();
    setVoteMinOrMax(vote);
  }, [activeCategory, newAccount, network, render])

  useEffect(() => {
    callAdminQuery(setAdminAddressDB)
  }, [newAccount, network]);

  const selectCategoryHandler = (category) => {
    setListData([]);
    setActiveCategory(category);
  }

  const GovernanceVoteHandler = async (diff, level, questKey, answer, _id) => {
    setLoading(true);
    await voteGovernance(diff, level, questKey, answer, _id)
    setRender(!render);
    setLoading(false);
  };

  const ResultHandler = async (level, _id, diff, answerKey, list) => {
    setLoading(true);
    await resultGovernance(level, _id, diff, answerKey, list, selectLevel, setSelectLevel, setMakeSelect, voteMinOrMax, setDraftModal, setLoading)
    setRender(!render);
    setLoading(false);
  }

  const setQuestEndTime = async (level, questKey, governanceId) => {
    setLoading(true);
    await questEndTime(level, questKey, governanceId, setNowTime);
    setRender(!render);
    setLoading(false);
  }

  const AnswerConfirmHandler = async (questKey, answerKey, answerId, answerTitle, itemId, itemQuestId) => {
    await answerConfirm(questKey, answerKey, answerId, answerTitle, itemId, itemQuestId, setLoading, render, setRender, setSelectedAnswer);
  }

  const SelectAnswerHandler = (answer) => {
    if(selectedAnswer !== answer) {
      setSelectedAnswer(answer)
      return;
    }
    if(selectedAnswer === answer) {
      setSelectedAnswer('')
      return;
    }
    if(!selectedAnswer) {
      setSelectedAnswer(answer)
      return;
    } 
  }

  const setMakeHandler = async (e, level, _id, list) => {
    await makeConfirm(e, level, _id, list, selectLevel, setSelectLevel, setLoading, render, setRender, setMakeSelect, setDraftModal);
  }

  const CancelHandler = async (list, diff) => {
    const questKey = list.quest.questKey
    const questId = list.quest._id
    const governanceId = list._id
    await cancelConfirm(diff, governanceId, questKey, questId, setLoading, render, setRender, setDraftModal, list, setSelectLevel, selectLevel);
  }

  console.log(selectLevel);

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
    const {lastValue, lastId} = lastElementsForPage(listData, `${activeCategory}EndTime`)
    await callQuestListQuery(setListData, setLoading, activeCategory, lastValue, lastId, setNotData)
  }

  useEffect(() => {
    if(!notData && listData.length !== 0) {
      getQuestList()
    }
  }, [page])

  const MaxVote = voteMinOrMax !== {} ? Number(voteMinOrMax.maxVote) : 0;
  const MinVote = voteMinOrMax !== {} ? Number(voteMinOrMax.minVote) : 0;

  return (
    <div className="bg-quest">
      <div className="dao-container" style={{paddingBottom: '0'}}>
        {/* 카테고리 영역 */}
        <div className="dao-category-section">
          <ul>
            {
              categories.map((category, idx) => {
                return (
                <li key={`category ${idx}`} className={"swiper-slide " + (category.CategoryName === activeCategory ? 'active' : '')} onClick={() => selectCategoryHandler(category.CategoryName)} style={{cursor:'pointer'}}>
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
        <div className='dao-quest-list-columns'>
          {/* Quest 리스트 루프 Start*/}
          <ul className='paginationContent'>
          {
            loading && listData.length === 0 ? (
              <div className='wait-list'>
                <h2>Wait Loading List...</h2>
              </div>
            ) : null
          }
          {
            !loading && listData.length === 0 ? (
              <div className='not-list-data'>
                <h2>
                  No Quests {activeCategory} Exist.
                </h2>
              </div>
            ) : (null)
          }
          {
            listData && listData.map((list, idx) => {
              const questTitle = list.quest.titleKR;
              const category = list.level === 'draft' ? 'Draft' : list.level === 'success' ? 'Success' : list.level === 'answer' ? 'Answer' : 'Cancel';

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
              const totalAmount = category === 'Draft' || category === 'Success' ? agreeVote + disagreeVote : category === 'Answer' ? list.answerTotalVote : 0;
              const agreePer = !isFinite(agreeVote / totalAmount) ? '0' : ((agreeVote / totalAmount) * 100).toFixed(2);
              const disagreePer = !isFinite(disagreeVote / totalAmount) ? '0' : ((disagreeVote / totalAmount) * 100).toFixed(2);

              const draftTotal = !isFinite(Number(list?.approveTotalVote) + Number(list?.rejectTotalVote)) ? 0 : Number(list?.approveTotalVote) + Number(list?.rejectTotalVote);
              const successTotal = !isFinite(Number(list?.successTotalVote) + Number(list?.adjournTotalVote)) ? 0 : Number(list?.successTotalVote) + Number(list?.adjournTotalVote);

              const closedVote = category === 'Draft' ? MaxVote : category === 'Success' ? draftTotal : category === 'Answer' ? successTotal : 0;
              
              return (
                // eslint-disable-next-line react/jsx-key
                list.level === activeCategory ? (
                  <li
                    key={`list ${idx}`}
                    className={
                      `${(makeSelect && selectLevel._id === list.quest._id) || (draftModal === true && selectLevel._id === list.quest._id) ? 'modalOpen' : ''} ${listData.length !== 0 && listData.length - 1 === idx ? 'lastList' : ''}`
                    }>
                    <h2>
                      {/* 총 투표수 작성 */}
                      <div>
                        {category} <span>{addComma(totalAmount)}</span>
                      </div>
                      <div className='endtime'>
                        {
                          (totalAmount < closedVote && diff > 0) ? (<div>{diffHour > 9 ? diffHour : '0' + diffHour}:{diffMin > 9 ? diffMin : '0' + diffMin}:{diffSec > 9 ? diffSec : '0' + diffSec}</div>) : (<div className='closed'>Closed</div>)
                        }
                      </div>
                    </h2>
                    <p onClick={async () => {
                        let isLogin = false;

                        await checkLogin(walletData).then((res) => {
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
                    <ul className={list.level === 'answer' ? 'answer-list' : ''}>
                      {
                        list.level === 'answer' ? 
                        (
                          list.quest.answerId.sort(function(a, b) {
                            return a.questAnswerKey - b.questAnswerKey
                          }).map((answer, idx) => {
                            const totalVote = list.answerTotalVote;
                            const percent = !isFinite(answer.totalVotes / totalVote) ? '0' : ((answer.totalVotes / totalVote) * 100).toFixed(2);
                            return (
                              <li key={`answer ${idx}`} onClick={() => SelectAnswerHandler(answer)} style={{cursor:'pointer'}} className={`${selectedAnswer == answer && 'active'}`}>
                                <div>{answer.title}</div>
                                <p>
                                  {answer.totalVotes ?? 0}({percent}%)
                                </p>
                                <h2>
                                  <div style={{ width: `${percent ?? 0}%`}}></div>
                                </h2>
                              </li>
                            )
                          })
                        )
                        :
                        (
                          answerList.map((answer, idx) => {
                            if(list.level === answer.level) {
                              return (
                                <li key={`answerlist ${idx}`}>
                                  <div>{answer.title}</div>
                                  <p>
                                    {answer.title === 'Approve' || answer.title === 'Success' ? agreeVote : disagreeVote}({answer.title === 'Approve' || answer.title === 'Success' ? agreePer : disagreePer}%)
                                  </p>
                                  <h2>
                                    <div style={{ width: `${answer.title === 'Approve' || answer.title === 'Success' ? agreePer : disagreePer ?? 0}%` }}></div>
                                  </h2>
                                </li>
                              )
                            }
                          })
                        )
                      }
                    </ul>
                    <div className={
                      `selectBtn
                      ${
                        adminAddressDB !== newAccount && (
                        (list?.level === 'draft' && list?.quest?.votingList[0]?.draftTxHash) ||
                        (list?.level === 'success' && list?.quest?.votingList[0]?.successTxHash) ||
                        (list?.level === 'success' && !(list?.quest?.votingList[0]?.draftTxHash)) ||
                        (list?.level === 'answer' && list?.quest?.votingList[0]?.answerTxHash) ||
                        (list?.level === 'answer' && !(list?.quest?.votingList[0]?.draftTxHash)) ||
                        (list?.level === 'answer' && !(list?.quest?.votingList[0]?.successTxHash)) ||
                        diff < 0 || totalAmount >= closedVote) ? 'vote-finish' : ''}`
                    }>
                      <div>Would you like to vote for the Quest {category}?</div>
                      <div>
                        {
                          list.level === 'answer' ?
                          (
                            <button
                              className="answerBtn"
                              onClick={
                                () => {
                                  AnswerConfirmHandler(
                                    list?.quest?.questKey,
                                    selectedAnswer?.questAnswerKey,
                                    selectedAnswer?._id,
                                    selectedAnswer?.title,
                                    list?._id,
                                    list?.quest._id
                                  )
                                }
                              }>Confirm</button>
                          ) :
                          (
                            answerList && answerList.map((answer, idx) => {
                              if(answer.level === list.level) {
                                return (
                                  <button
                                    key={`button ${idx}`}
                                    onClick={
                                      () => {
                                        GovernanceVoteHandler(
                                          diff,
                                          list?.level,
                                          list?.quest.questKey,
                                          answer?.title.toLowerCase(),
                                          list?.quest._id,
                                          list
                                        )
                                      }
                                    }
                                    disabled={
                                      (list?.level === 'draft' && list?.quest?.votingList[0]?.draftTxHash) ||
                                      (list?.level === 'success' && list?.quest?.votingList[0]?.successTxHash) ||
                                      (list?.level === 'success' && !(list?.quest?.votingList[0]?.draftTxHash)) ||
                                      (list?.level === 'answer' && list?.quest?.votingList[0]?.answerTxHash) ||
                                      (list?.level === 'answer' && !(list?.quest?.votingList[0]?.draftTxHash)) ||
                                      (list?.level === 'answer' && !(list?.quest?.votingList[0]?.successTxHash)) ||
                                      diff < 0 || totalAmount >= closedVote ? true : false
                                    }
                                  >
                                    {answer.title}
                                    {
                                      adminAddressDB === newAccount ? 
                                      (
                                        <span>({answer.title === 'Approve' || answer.title === 'Success' ? agreeVote : disagreeVote})</span>
                                      ) : (null)
                                    }
                                  </button>
                                )
                              }
                            })
                          )
                        }
                      </div>
                      {
                        adminAddressDB === newAccount ? (
                          <button
                            onClick={() => setQuestEndTime(list.level, list.quest.questKey, list._id)}
                            className="adminConfirmBtn">
                            End
                          </button>
                        ) : (null)
                      }
                      {
                        adminAddressDB === newAccount && (diff < 0 || totalAmount >= closedVote) ?
                        (
                          list.level === "answer" ? (
                            <>
                              <button
                                onClick={() => resultModalHandler(setDraftModal, setSelectLevel, list?.level, list?.quest?._id, list)}
                                className="adminConfirmBtn"
                                disabled={list.answerResult && list.answerResult === 'AnswerCancel' ? true : false}
                              >
                                  {
                                    !list.answerResult ? (
                                      'Result Confirm(1st STEP)'
                                    ) :
                                    list.answerResult && list.answerResult === 'AnswerCancel' ? (
                                      'Result Confirm'
                                    ) :
                                    list.answerResult && list.quest.statusType !== 'SUCCESS' ? (
                                      'Result Confirm(2nd STEP)'
                                    ) :
                                    list.answerResult && list.quest.statusType === 'SUCCESS' && list.level === 'answer' ? (
                                      'Result Confirm(3rd STEP)'
                                    ) : (null)
                                  }
                              </button>
                              <button
                                onClick={(e) => cancelModalHandler(setDraftModal, setSelectLevel, list?.level, list?.quest?._id, list, e)}
                                className="adminConfirmBtn"
                                disabled={list.answerResult && list.answerResult !== 'AnswerCancel' ? true : false}
                              >
                                {
                                  !list.answerResult ? (
                                    'Cancel(1st STEP)'
                                  ) :
                                  list.answerResult && list.answerResult !== 'AnswerCancel' ? (
                                    'Cancel'
                                  ) :
                                  list.answerResult === 'AnswerCancel' && list.quest.statusType !== 'ADJOURN' ? (
                                    'Cancel(2nd STEP)'
                                  ) :
                                  (null)
                                }
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => resultModalHandler(setDraftModal, setSelectLevel, list?.level, list?.quest?._id, list)}
                              className="adminConfirmBtn"
                            >
                              {
                                list.level === 'draft' ? (
                                  !list.draftResult ? (
                                    'Result Confirm(1st STEP)'
                                  ) : (
                                    'Result Confirm(2nd STEP)'
                                  )
                                ) :
                                list.level === 'success' ? (
                                  !list.successResult ? (
                                    'Result Confirm(1st STEP)'
                                  ) : (
                                    'Result Confirm(2nd STEP)'
                                  )
                                ) : (null)
                              }
                            </button>
                          )
                        )
                        :
                        (null)
                      }
                      {
                        adminAddressDB !== newAccount && (diff < 0 || totalAmount >= closedVote) ?
                        (
                          <div className='vote-alarm'>
                            <p>QUEST CLOSED</p>
                          </div>
                        ) :
                        adminAddressDB !== newAccount && (
                        (list?.level === 'draft' && list?.quest?.votingList[0]?.draftTxHash) ||
                        (list?.level === 'success' && list?.quest?.votingList[0]?.successTxHash) ||
                        (list?.level === 'answer' && list?.quest?.votingList[0]?.answerTxHash)) ? 
                        (
                          <div className='vote-alarm'>
                            <p>ALREADY VOTED</p>
                          </div>
                        ) :
                        adminAddressDB !== newAccount && (
                        (list?.level === 'success' && !(list?.quest?.votingList[0]?.draftTxHash)) ||
                        (list?.level === 'answer' && !(list?.quest?.votingList[0]?.draftTxHash)) ||
                        (list?.level === 'answer' && !(list?.quest?.votingList[0]?.successTxHash))) ?
                        (
                          <div className='vote-alarm'>
                            <p>NO PREVIOUS VOTE</p>
                          </div>
                        ) : (null)
                      }
                    </div>
                    {
                      makeSelect && selectLevel._id === list.quest._id ? (
                          selectLevel.result ? (
                            <div className="makeselect">
                              <p>The number of votes is the same. Admin please select the correct answer. Continue 2nd Step</p>
                              <div>
                                <button className="continueBtn" onClick={(e) => {setMakeHandler(e, list?.level, list?.quest?._id, list)}}>
                                  Continue
                                </button>
                              </div>
                              <div
                                className="closeBtn"
                                onClick={() => {setMakeSelect(false)}}
                              >
                                <Icon icon="material-symbols:close-rounded" />
                              </div>
                            </div>
                          ) : (
                            <div className="makeselect">
                              <p>The number of votes is the same. Admin please select the correct answer.</p>
                              <div>
                                <button onClick={(e) => {setMakeHandler(e, list?.level, list?.quest?._id, list)}}>
                                  {selectLevel?.level === 'draft' ? 'Approve' : 'Success'}
                                </button>
                                <button onClick={(e) => {setMakeHandler(e, list?.level, list?.quest?._id, list)}}>
                                  {selectLevel?.level === 'draft' ? 'Reject' : 'Adjourn'}
                                </button>
                              </div>
                              <div
                                className="closeBtn"
                                onClick={() => {setMakeSelect(false)}}
                              >
                                <Icon icon="material-symbols:close-rounded" />
                              </div>
                            </div>
                          )
                      ) : (null)
                    }
                    {
                      draftModal && selectLevel._id === list.quest._id ? (
                        (
                          list.level === selectLevel.level ?
                          (
                            <div className="waitModal">
                              <p>
                                {
                                  list.level === 'answer' && selectLevel.cancel ? (
                                    !selectLevel.result ? `Get ${list.level} Quest Cancel 1st Step` :
                                    selectLevel.result ? `Get ${list.level} Quest Cancel 2nd Step` : null
                                  ) : list.level === 'answer' && !selectLevel.cancel ? (
                                    !selectLevel.answer ? `Get ${list.level} Quest Results 1st Step` :
                                    selectLevel.answer && selectLevel.status !== 'SUCCESS' ? `Get ${list.level} Quest Results 2nd Step` :
                                    selectLevel.answer && selectLevel.status === 'SUCCESS' && selectLevel.level === 'answer' ? `Get ${list.level} Quest Results 3rd Step` : null
                                  ) :
                                  (
                                    !selectLevel.result ? `Get ${list.level} Quest Results 1st Step` : `Get ${list.level} Quest Results 2nd Step`
                                  )
                                }
                              </p>
                              <div>
                                <button onClick={() => {setDraftModal(false)}}>
                                  Cancel
                                </button>
                                {
                                  list.level === 'answer' && selectLevel.cancel ? (
                                    <button onClick={() => CancelHandler(list, diff)}>
                                      Start
                                    </button>
                                  ) : list.level === 'answer' && !selectLevel.cancel ? (
                                    <button onClick={() => ResultHandler(list?.level, list?.quest?._id, diff, selectedAnswer?.questAnswerKey, list)}>
                                      Start
                                    </button>
                                  ) :
                                  (
                                    <button onClick={() => ResultHandler(list?.level, list?.quest?._id, diff, 'not', list)}>
                                      Start
                                    </button>
                                  )
                                }
                              </div>
                            </div>
                          ) : (null)
                        )
                      ) : (null)
                    }
                  </li>
                ) : (null)
              );
            })
          }
          <div ref={obsRef} style={{width: '100%'}}></div>
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
