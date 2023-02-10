import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import "react-datepicker/dist/react-datepicker.css";

import { urlFor, client } from "../../../sanity";
import { useLoadingState } from "@assets/context/LoadingContext";

import Moment from 'moment';

import "react-responsive-modal/styles.css";
import { useWalletData } from '@data/wallet';
import { checkLogin } from "@api/UseTransactions";

import toastNotify from '@utils/toast';
import { Icon } from '@iconify/react';
import Web3 from "web3";

import { MarketContract, GovernanceContract } from "../contractHelper";
import { voteGovernance } from "../list/useVoteGovernance"
import { resultGovernance } from "../list/useResultGovernance"

function Index() {
  const { walletData } = useWalletData();

  const { setLoading } = useLoadingState();
  const history = useHistory();

  const [ listData, setListData ] = useState([]);
  const [ activeCategory, setActiveCategory ] = useState('draft');
  const [ nowTime, setNowTime ] = useState(new Date());
  const [ newAccount, setNewAccount ] = useState(window?.klaytn?.selectedAddress?.toLowerCase());
  const [ adminAddressDB, setAdminAddressDB ] = useState('');
  const [ render, setRender ] = useState(false);
  const [ selectedAnswer, setSelectedAnswer] = useState();
  const [ makeSelect, setMakeSelect ] = useState(false);
  const [ selectLevel, setSelectLevel ] = useState('');
  useEffect(async () => {
    setInterval(() => {
      setNowTime(new Date())
    }, 1000)
  }, [])
  const web3 = new Web3(window.klaytn);

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

  const amdinContractAddress = '0x867385AcD7171A18CBd6CB1ddc4dc1c80ba5fD52';

  // klaytn Account Change 감지
  window.klaytn.on('accountsChanged', (accounts) => {
    setNewAccount(accounts[0]);
  });

  useEffect(async () => {
    setLoading(true);
    // GovernanceItem list 조회
    const governanceVoteQuery = `*[_type == 'governanceItem' && _id != '${Date.now()}']
    {
      ...,
      'quest': *[_type == 'quests' && _id == ^.questKey._ref && _id != '${Date.now()}'][0]{
        ...,
        'answerId': *[_type == 'questAnswerList' && questKey == ^.questKey && _id != '${Date.now()}'] {title, _id, totalVotes, questAnswerKey},
        'votingList': *[_type == 'governanceItemVote' && governanceItemId == ^._id && voter == '${newAccount}' && _id != '${Date.now()}']
      },
    }`;
    client.fetch(governanceVoteQuery).then((governanceItem) => {
      setListData(governanceItem);
      setLoading(false);
      console.log('rendering!')
    });
  }, [activeCategory, newAccount, render])

  useEffect(() => {
    const AdminAddressQuery = `*[_type == 'admin' && active == true && _id != '${Date.now()}']`
    client.fetch(AdminAddressQuery).then((adminlist) => {
      adminlist.map((admin) => {
        if(admin.walletAddress.toLowerCase() === amdinContractAddress.toLowerCase()) {
          setAdminAddressDB(admin.walletAddress);
        }
      })
    })
  }, [newAccount]);

  const GovernanceVoteHandler = async (diff, level, questKey, answer, _id, list) => {
    setLoading(true);
    await voteGovernance(diff, level, questKey, answer, _id)
    setRender(!render);
    setLoading(false);
  };

  const ResultHandler = async (level, _id, diff, answerKey, list) => {
    const agreeVote = list.level === 'draft' ? list.approveTotalVote : list.level === 'success' ? list.successTotalVote : 0;
    const disagreeVote = list.level === 'draft' ? list.rejectTotalVote : list.level === 'success' ? list.adjournTotalVote : 0;
    const totalVote = list.level === 'draft' || list.level === 'success' ? agreeVote + disagreeVote : list.level === 'answer' ? list.answerTotalVote : 0;

    setLoading(true);

    if(totalVote >= 10 && agreeVote === disagreeVote) {
      try {
        if(level === 'draft' || level === 'success') {
          setLoading(false);
          setSelectLevel({level: level, _id: _id})
          setMakeSelect(true);
        }
      } catch (err) {
        console.log(err);
        setMakeSelect(false);
        toastNotify({
          state: 'error',
          message: `Failed Set Quest.`,
        });
        setLoading(false);
      }
      return;
    }
    
    await resultGovernance(level, _id, diff, answerKey, list)
    setRender(!render);
    setLoading(false);
  }

  const setQuestEndTime = async (level, questKey, questId) => {
    setLoading(true);
    const accounts = await window.klaytn.enable();
    const account = accounts[0];
    const endQuestQuery = `*[_type == 'governanceItem' && references('${questId}') && _id != '${Date.now()}']`

    if(level === "draft") {
      const receipt = await GovernanceContract().methods.setQuestEndTime(questKey).send({from : account})
      console.log('draftEnd', receipt)
      client.fetch(endQuestQuery).then(async (list) => {
        await client.patch(list[0]._id).set({draftEndTime: Moment().format("yyyy-MM-DD HH:mm:ss")}).commit();
        setNowTime(new Date());
        setLoading(false);
        setRender(!render);
      })
    }

    if(level === "success") {
      const receipt = await GovernanceContract().methods.setDecisionEndTime(questKey).send({from : account})
      console.log('successEnd', receipt)
      client.fetch(endQuestQuery).then(async (list) => {
        await client.patch(list[0]._id).set({successEndTime: Moment().format("yyyy-MM-DD HH:mm:ss")}).commit();
        setNowTime(new Date());
        setLoading(false);
        setRender(!render);
      })
    }
    
    if(level === "answer") {
      const receipt = await GovernanceContract().methods.setAnswerEndTime(questKey).send({from : account})
      console.log('answerEnd', receipt)
      client.fetch(endQuestQuery).then(async (list) => {
        await client.patch(list[0]._id).set({answerEndTime: Moment().format("yyyy-MM-DD HH:mm:ss")}).commit();
        setNowTime(new Date());
        setLoading(false);
        setRender(!render);
      })
    }
  }

  const AnswerConfirmHandler = async (questKey, answerKey, answerId, answerTitle, itemId, itemQuestId) => {
    if(!answerKey) {
      toastNotify({
        state: 'error',
        message: `Please Check Answer.`,
      });
      return;
    }

    setLoading(true);
    try {
      const accounts = await window.klaytn.enable();
      const account = accounts[0];
      const receipt = await GovernanceContract().methods.voteAnswer(questKey, answerKey).send({from : account})
      const returnValue = receipt?.events?.VoteAnswerCast?.returnValues;
      console.log(returnValue);
      const answerQuery = `*[_type == 'questAnswerList' && _id == '${answerId}' && _id != '${Date.now()}']`
      console.log('query after')
      client.fetch(answerQuery).then(async (answer) => {
        if(answer[0].totalVotes === null || answer[0].totalVotes === undefined) {
          await client.patch(answer[0]._id).set({totalVotes: 0}).commit();
          await client.patch(answer[0]._id).inc({totalVotes: returnValue.votedNfts.length}).commit();
          await client.patch(itemId).inc({answerTotalVote: returnValue.votedNfts.length}).commit()
        } else {
          await client.patch(answer[0]._id).inc({totalVotes: returnValue.votedNfts.length}).commit();
          await client.patch(itemId).inc({answerTotalVote: returnValue.votedNfts.length}).commit()
        }
        const SuccessAnswerQuery = `*[_type == 'governanceItemVote' && governanceItemId == '${itemQuestId}' && voter == '${account.toLowerCase()}' && _id != '${Date.now()}']`;
        await client.fetch(SuccessAnswerQuery).then(async (list) => {
          console.log(list);
          await client.patch(list[0]._id).set(
            {
              answerOption: answerTitle,
              answerCount: returnValue.votedNfts.length,
              answerTxHash: receipt.transactionHash,
            }
          ).commit();
        })
        toastNotify({
          state: 'success',
          message: `${returnValue.votedNfts.length} Votes to Success this Quest.`,
        });
        setSelectedAnswer('');
        setRender(!render);
        setLoading(false);
      })
    } catch(err) {
      console.log(err)
      toastNotify({
        state: 'error',
        message: `Check Your Account.`,
      });
      setSelectedAnswer('');
      setLoading(false);
    }
  }

  const setMakeHandler = async (e) => {
    setMakeSelect(false);
    setLoading(true);
    try {
      const newDraftTotalQuery = `*[_type == 'governanceItem' && references('${selectLevel._id}') && _id != '${Date.now()}']
      {
        ...,
        'questKey': *[_type == 'quests' && _id == ^.questKey._ref && _id != '${Date.now()}'][0]
      }`;
      client.fetch(newDraftTotalQuery).then(async (vote) => {
        const marketKey = vote[0].questKey.questKey;
        const creator = vote[0].questKey.creatorAddress;
        const title = vote[0].questKey.titleKR;
        const creatorFee = Number(vote[0].questKey.creatorPay) / 10 ** 18;
        const creatorFeePercentage = vote[0].questKey.creatorFee;
        const cojamFeePercentage = vote[0].questKey.cojamFee;
        const charityFeePercentage = vote[0].questKey.charityFee;
        const answer = e.target.innerText.toLowerCase();
        const questKey = vote[0].questKey.questKey;
        const questId = vote[0]._id;

        const answerKeyQuery = `*[_type == 'questAnswerList' && questKey == ${questKey} && _id != '${Date.now()}']`;
        const answerKeyList = [];
        await client.fetch(answerKeyQuery).then((answers) => {
          console.log(answers);
          answers.forEach((answer) => {
            console.log(answer)
            answerKeyList.push(answer.questAnswerKey);
          });
        });
        console.log(selectLevel)
        try {
          if(selectLevel.level === 'draft') {
            const receipt = await GovernanceContract().methods.makeQuestResult(questKey, answer).send({from : newAccount, gas: 500000})
            console.log('makeQuest', receipt);
            if(receipt.events.QuestResult.returnValues.result === 'approve') {
              await client.patch(questId).set({level: 'draftEnd'}).commit();
              const publish = await MarketContract().methods.publishMarket(
                marketKey,
                creator,
                title,
                creatorFee,
                creatorFeePercentage,
                cojamFeePercentage,
                charityFeePercentage,
                answerKeyList
              ).send({from : newAccount, gas: 750000});
              const approveListQuery = `*[_type == 'quests' && _id == '${vote[0].questKey._id}' && _id != '${Date.now()}']`
              client.fetch(approveListQuery).then(async (list) => {
                console.log(list);
                await client.patch(list[0]._id).set({
                  statusType: 'APPROVE',
                  questStatus: 'APPROVE',
                  approveTx: publish.transactionHash,
                  approveDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                  updateMember: newAccount,
                }).commit();
              })
              toastNotify({
                state: 'success',
                message: `Approve Draft End Quest`,
              });
            } else {
              await client.patch(questId).set({level: 'reject'}).commit();
              toastNotify({
                state: 'success',
                message: `Reject Draft End Quest`,
              });
            }
          }

          if(selectLevel.level === 'success') {
            try {
              const receipt = await GovernanceContract().methods.makeDecisionAndExecuteAnswer(questKey, answer, answerKeyList).send({from : newAccount, gas: 500000})
              console.log(receipt)
              if(receipt.events.DecisionResult.returnValues.result === 'success') {
                await client.patch(questId).set({
                  level: 'answer',
                  answerStartTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                  answerEndTime: Moment().add(1, 'days').format("yyyy-MM-DD HH:mm:ss"),
                  answerTotalVote: 0
                }).commit();
                toastNotify({
                  state: 'success',
                  message: `Success Success End Quest`,
                });
              } else {
                const adjourn = await MarketContract().methods.adjournMarket(questKey).send({from : newAccount, gas: 500000})
                console.log(adjourn)
                await client.patch(questId).set({level: 'adjourn'}).commit();
                const adjournListQuery = `*[_type == 'quests' && _id == '${vote[0].questKey._id}' && _id != '${Date.now()}']`
                client.fetch(adjournListQuery).then(async (list) => {
                  console.log(list);
                  await client.patch(list[0]._id).set({
                    statusType: 'ADJOURN',
                    questStatus: 'ADJOURN',
                    approveTx: receipt.transactionHash,
                    adjournDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                    updateMember: newAccount,
                  }).commit();
                })
                toastNotify({
                  state: 'success',
                  message: `Success Adjourn End Quest`,
                });
              }
            } catch (err) {
              console.log(err);
            }
          }
          setRender(!render);
          setLoading(false);
        } catch (err) {
          console.log(err);
          toastNotify({
            state: 'error',
            message: `Failed Make Quest`,
          });
          setLoading(false);
        }
      })
    } catch (err) {
      console.log(err)
      toastNotify({
        state: 'error',
        message: `Failed Make Quest`,
      });
      setLoading(false);
    }
  }

  const CancelHandler = async (list, diff) => {
    console.log(list)
    const questKey = list.quest.questKey
    setLoading(true);
    if(diff < 0) {
      try {
        const receipt = await GovernanceContract().methods.cancelAnswer(questKey, '').send({from: newAccount, gas: 500000})
        console.log(receipt)
        if(receipt) {
          const adjourn = await MarketContract().methods.adjournMarket(questKey).send({from : newAccount, gas: 500000})
          console.log(adjourn)
          const approveListQuery = `*[_type == 'quests' && _id == '${list.quest._id}' && _id != '${Date.now()}']`
          client.fetch(approveListQuery).then(async (list) => {
            console.log('list', list)
            await client.patch(list[0]._id).set({
              statusType: 'ADJOURN',
              questStatus: 'ADJOURN',
              adjournTx: receipt.transactionHash,
              adjournDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
              updateMember: newAccount,
            }).commit();
            toastNotify({
              state: 'success',
              message: `Success Cancel Quest`,
            });
          })
        }
        setLoading(false);
      } catch (err) {
        console.log(err);
        toastNotify({
          state: 'error',
          message: `Failed Cancel Quest`,
        });
        setLoading(false);
      }
    }
  }

  return (
    <div className="bg-quest">
      <div className="dao-container" style={{paddingBottom: '0'}}>
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
        <div className='dao-quest-list-columns'>
          {/* Quest 리스트 루프 Start*/}
          <ul className='paginationContent'>
          {
            listData && listData.map((list, index) => {
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
              
              return (
                // eslint-disable-next-line react/jsx-key
                <>
                  {
                    list.level === activeCategory ? (
                      <li key={index} className={`${makeSelect && selectLevel._id === list.quest._id ? 'modalOpen' : ''}`}>
                        <h2>
                          {/* 총 투표수 작성 */}
                          <div>
                            {category} <span>{addComma(totalAmount)}</span>
                          </div>
                          <div className='endtime'>
                            {
                              (totalAmount < 5000 && diff > 0) ? (<div>{diffHour > 9 ? diffHour : '0' + diffHour}:{diffMin > 9 ? diffMin : '0' + diffMin}:{diffSec > 9 ? diffSec : '0' + diffSec}</div>) : (<div className='closed'>Closed</div>)
                            }
                          </div>
                        </h2>
                        <p onClick={async () => {
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
                        <ul className={list.level === 'answer' ? 'answer-list' : ''}>
                          {
                            list.level === 'answer' ? 
                            (
                              list.quest.answerId.map((answer, index) => {
                                const totalVote = list.answerTotalVote;
                                const percent = !isFinite(answer.totalVotes / totalVote) ? '0' : ((answer.totalVotes / totalVote) * 100).toFixed(2);
                                return (
                                  <li key={index} onClick={() => setSelectedAnswer(answer)} style={{cursor:'pointer'}} className={`${selectedAnswer == answer && 'active'}`}>
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
                              answerList.map((answer, index) => {
                                if(list.level === answer.level) {
                                  return (
                                    <li key={index}>
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
                            (list?.level === 'answer' && list?.quest?.votingList[0]?.answerTxHash) ||
                            diff < 0 || totalAmount >= 5000) ? 'vote-finish' : ''}`
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
                                        list.quest.questKey,
                                        selectedAnswer.questAnswerKey,
                                        selectedAnswer._id,
                                        selectedAnswer.title,
                                        list._id,
                                        list.quest._id
                                      )
                                    }
                                  }>Confirm</button>
                              ) :
                              (
                                answerList && answerList.map((answer, index) => {
                                  if(answer.level === list.level) {
                                    return (
                                      <button
                                        key={index}
                                        onClick={
                                          () => {
                                            GovernanceVoteHandler(
                                              diff,
                                              list.level,
                                              list.quest.questKey,
                                              answer.title.toLowerCase(),
                                              list.quest._id,
                                              list
                                            )
                                          }
                                        }
                                        disabled={
                                          (list?.level === 'draft' && list?.quest?.votingList[0]?.draftTxHash) ||
                                          (list?.level === 'success' && list?.quest?.votingList[0]?.successTxHash) ||
                                          (list?.level === 'answer' && list?.quest?.votingList[0]?.answerTxHash) ? true : false
                                        }
                                      >
                                        {
                                          (list?.level === 'draft' && list?.quest?.votingList[0]?.draftTxHash) ||
                                          (list?.level === 'success' && list?.quest?.votingList[0]?.successTxHash) ||
                                          (list?.level === 'answer' && list?.quest?.votingList[0]?.answerTxHash) ? 'VOTED' : answer.title
                                        }
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
                                onClick={() => setQuestEndTime(list.level, list.quest.questKey, list.quest._id)}
                                className="adminConfirmBtn">
                                End
                              </button>
                            ) : (null)
                          }
                          {
                            adminAddressDB === newAccount && (diff < 0 || totalAmount >= 5000) ?
                            (
                              list.level === "answer" ? (
                                <>
                                  <button
                                    onClick={() => ResultHandler(list.level, list.quest._id, diff, selectedAnswer.questAnswerKey)}
                                    className="adminConfirmBtn">
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => CancelHandler(list, diff)}
                                    className="adminConfirmBtn"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => ResultHandler(list.level, list.quest._id, diff, 'not', list)}
                                  className="adminConfirmBtn"
                                >
                                  Confirm
                                </button>
                              )
                            )
                            :
                            (null)
                          }
                          {
                            adminAddressDB !== newAccount && (diff < 0 || totalAmount >= 5000) ? (
                              <div className='vote-alarm'>
                                <p>QUEST CLOSED</p>
                              </div>
                            ) :
                            adminAddressDB !== newAccount && (
                            (list?.level === 'draft' && list?.quest?.votingList[0]?.draftTxHash) ||
                            (list?.level === 'success' && list?.quest?.votingList[0]?.successTxHash) ||
                            (list?.level === 'answer' && list?.quest?.votingList[0]?.answerTxHash)) ? (
                              <div className='vote-alarm'>
                                <p>ALREADY VOTED</p>
                              </div>
                            ) : (null)
                          }
                        </div>
                        {
                          makeSelect && selectLevel._id === list.quest._id ? (
                            <div className="makeselect">
                              <p>The number of votes is the same. Admin please select the correct answer.</p>
                              <div>
                                <button onClick={(e) => {setMakeHandler(e)}}>
                                  {selectLevel?.level === 'draft' ? 'Approve' : 'Success'}
                                </button>
                                <button onClick={(e) => {setMakeHandler(e)}}>
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
                          ) : (null)
                        }
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
