import { client } from "../../../sanity";
import { MarketContract, GovernanceContract } from "../contractHelper";
import Moment from 'moment';
import toastNotify from '@utils/toast';
import Web3 from "web3";

export const resultGovernance = async (level, _id, diff, answerKey, list, selectLevel, setSelectLevel, setMakeSelect, voteMinOrMax, setDraftModal, setLoading) => {
  const web3 = new Web3(window.klaytn);

  const accounts = await window.klaytn.enable()
  const account = accounts[0];
  const agreeVote = list.level === 'draft' ? list.approveTotalVote : list.level === 'success' ? list.successTotalVote : 0;
  const disagreeVote = list.level === 'draft' ? list.rejectTotalVote : list.level === 'success' ? list.adjournTotalVote : 0;
  const totalVote = list.level === 'draft' || list.level === 'success' ? agreeVote + disagreeVote : list.level === 'answer' ? list.answerTotalVote : 0;
  const questKey = list.quest.questKey;
  const governanceId = list._id;
  const questId = list.quest._id;

  const marketKey = list.quest.questKey;
  const creator = list.quest.creatorAddress;
  const title = list.quest.titleKR;
  const creatorFee = Number(list.quest.creatorPay) / 10 ** 18;
  const creatorFeePercentage = list.quest.creatorFee;
  const cojamFeePercentage = list.quest.cojamFee;
  const charityFeePercentage = list.quest.charityFee;
  const MaxVote = voteMinOrMax !== {} ? Number(voteMinOrMax.maxVote) : 0;
  const MinVote = voteMinOrMax !== {} ? Number(voteMinOrMax.minVote) : 0;

  try {
    if(diff < 0 || totalVote <= MaxVote) {
      if(totalVote < MinVote) {
        try {
          if(level === 'draft') {
            setDraftModal(false);
            try {
              const receipt = await GovernanceContract().methods.cancelQuest(questKey).send({from : account})
              if(receipt) {
                await client.patch(governanceId).set({level: 'cancel'}).commit();
              }
              toastNotify({
                state: 'success',
                message: `Success Cancel Quest.`,
              });
            } catch (err) {
              toastNotify({
                state: 'error',
                message: `Failed Draft Cancel Quest.`,
              });
              setLoading(false);
              return;
            }
          }

          if(level === 'success') {
            setDraftModal(false)
            try {
              if(!list.successResult) {
                const receipt = await GovernanceContract().methods.cancelDecision(questKey).send({from : account})
                const result = receipt.events.DecisionCancel.returnValues.questKey;
                setSelectLevel({level: level, _id: _id, result: result})
                await client.patch(governanceId).set({successResult: result}).commit();
                setDraftModal(true);
                setLoading(false);
                return;
              }
            } catch (err) {
              toastNotify({
                state: 'error',
                message: `Failed Success Cancel Quest.`,
              });
              setLoading(false);
              return;
            }

            try {
              if(list.successResult && list.quest.statusType !== 'ADJOURN') {
                const adjourn = await MarketContract().methods.adjournMarket(questKey).send({from : account, gas: 500000})
                if(adjourn) {
                  await client.patch(questId).set({
                    statusType: 'ADJOURN',
                    questStatus: 'ADJOURN',
                    adjournTx: adjourn.transactionHash,
                    adjournDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                    updateMember: account,
                  }).commit();
                  await client.patch(governanceId).set({level: 'cancel'}).commit();
                  toastNotify({
                    state: 'success',
                    message: `Success Cancel Quest.`,
                  });
                }
              }
            } catch (err) {
              toastNotify({
                state: 'error',
                message: `Failed Success Cancel Quest.`,
              });
              setLoading(false);
              return;
            }
          }

          if(level === 'answer') {
            setDraftModal(false);
            try {
              toastNotify({
                state: 'error',
                message: `Please Click Cancel Quest Button.`,
              });
            } catch (err) {
              toastNotify({
                state: 'error',
                message: `Please Click Cancel Quest Button.`,
              });
            }
          }
        } catch (err) {
          setDraftModal(false);
          toastNotify({
            state: 'error',
            message: `Failed Set Quest.`,
          });
          return;
        }
      }

      if(level === 'draft' || level === 'success') {
        if(totalVote >= MinVote && agreeVote === disagreeVote) {
          try {
            setDraftModal(false);
            setMakeSelect(true);
            return;
          } catch (err) {
            setSelectLevel(null);
            setDraftModal(false);
            setMakeSelect(false);
            toastNotify({
              state: 'error',
              message: `Failed Set Quest.`,
            });
            return;
          }
        }
      }
      
      if(totalVote >= MinVote) {
        const answerKeyQuery = `*[_type == 'questAnswerList' && questKey == ${questKey} && _id != '${Date.now()}']`;
        const answerKeyList = [];
        await client.fetch(answerKeyQuery).then((answers) => {
          answers.forEach((answer) => {
            answerKeyList.push(answer.questAnswerKey);
          });
        });

        try {
          if(level === 'draft') {
            setDraftModal(false);
            try {
              if(!list.draftResult) {
                const receipt = await GovernanceContract().methods.setQuestResult(questKey).send({from : account, gas: 500000})
                const result = receipt.events.QuestResult.returnValues.result;
                setSelectLevel({level: level, _id: _id, result: result})
                await client.patch(governanceId).set({draftResult: result}).commit();
  
                try {
                  if(result === 'reject') {
                    await client.patch(governanceId).set({level: 'reject'}).commit();
                    toastNotify({
                      state: 'success',
                      message: `Reject Draft End Quest`,
                    });
                    setSelectLevel(null);
                    setLoading(false);
                    return;
                  }
                } catch {
                  toastNotify({
                    state: 'error',
                    message: `Failed Reject Draft End Quest`,
                  });
                  setLoading(false);
                  return;
                }
  
                setDraftModal(true);
                setLoading(false);
                return;
              }
            } catch (err) {
              toastNotify({
                state: 'error',
                message: `Failed Draft End Quest`,
              });
              setLoading(false);
              return;
            }

            try {
              if(list.draftResult === 'approve') {
                setDraftModal(false);
                const publish = await MarketContract().methods.publishMarket(
                  marketKey,
                  creator,
                  title,
                  creatorFee,
                  creatorFeePercentage,
                  cojamFeePercentage,
                  charityFeePercentage,
                  answerKeyList
                ).send({from : account, gas: 750000});
                await client.patch(questId).set({
                  statusType: 'APPROVE',
                  questStatus: 'APPROVE',
                  approveTx: publish.transactionHash,
                  draftTx: publish.transactionHash,
                  answerTx: publish.transactionHash,
                  approveDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                  updateMember: account,
                }).commit();
                await client.patch(governanceId).set({level: 'draftEnd'}).commit();
                toastNotify({
                  state: 'success',
                  message: `Approve Draft End Quest`,
                });
                setSelectLevel(null);
                return;
              }
            } catch (err) {
              toastNotify({
                state: 'error',
                message: `Failed Approve Draft End Quest`,
              });
              setLoading(false);
              return;
            }
          } else if(level === 'success') {
            setDraftModal(false);
            try {
              if(!list.successResult) {
                const receipt = await GovernanceContract().methods.setDecisionAndExecuteAnswer(questKey, answerKeyList).send({from : account, gas: 500000})
                const result = receipt.events.DecisionResult.returnValues.result;
                setSelectLevel({level: level, _id: _id, result: result})
                await client.patch(governanceId).set({successResult: result}).commit();
  
                try {
                  if(result === 'success') {
                    await client.patch(governanceId).set({
                      level: 'answer',
                      answerStartTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                      answerEndTime: Moment().add(1, 'days').format("yyyy-MM-DD HH:mm:ss"),
                      answerTotalVote: 0
                    }).commit();
                    toastNotify({
                      state: 'success',
                      message: `Success Success End Quest`,
                    });
                    setSelectLevel(null);
                    setLoading(false);
                    return;
                  }
                } catch {
                  toastNotify({
                    state: 'error',
                    message: `Failed Success End Quest`,
                  });
                  setLoading(false);
                  return;
                }

                setDraftModal(true);
                setLoading(false);
                return;
              }
            } catch {
              toastNotify({
                state: 'error',
                message: `Failed End Quest`,
              });
              setLoading(false);
              return;
            }
              
            try {
              if(list.successResult === 'adjourn') {
                setDraftModal(false);
                const adjourn = await MarketContract().methods.adjournMarket(questKey).send({from : account, gas: 500000})
                if(adjourn) {
                  await client.patch(questId).set({
                    statusType: 'ADJOURN',
                    questStatus: 'ADJOURN',
                    approveTx: adjourn.transactionHash,
                    adjournDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                    updateMember: account,
                  }).commit();
                  await client.patch(governanceId).set({level: 'adjourn'}).commit();
                  toastNotify({
                    state: 'success',
                    message: `Success Adjourn End Quest`,
                  });
                  setSelectLevel(null);
                  setLoading(false);
                  return;
                }
              }
            } catch {
              toastNotify({
                state: 'error',
                message: `Failed Adjourn End Quest`,
              });
              setLoading(false);
              return;
            }
          } else if(level === 'answer') {
            if(!answerKey) {
              setDraftModal(false);
              toastNotify({
                state: 'error',
                message: `Please Check Answer.`,
              });
              return;
            }

            setDraftModal(false);
            try {
              if(!list.answerResult) {
                const receipt = await GovernanceContract().methods.setAnswer(questKey, answerKeyList, answerKey).send({from : account, gas: 500000})
                const result = receipt.events.AnswerResult.returnValues;
                setSelectLevel({level: level, _id: _id, answer: result.answer, questKey: result.questKey})
                await client.patch(governanceId).set({answerResult: result.answer}).commit();
                setDraftModal(true);
                setLoading(false);
                return;
              }
            } catch {
              toastNotify({
                state: 'error',
                message: `Failed Answer End Quest`,
              });
              setDraftModal(false);
              setLoading(false);
              return;
            }

            try {
              if(list.answerResult && list.quest.statusType !== 'SUCCESS') {
                setDraftModal(false);
                setLoading(true);
                const successMarket = await MarketContract().methods.successMarket(Number(list.quest.questKey), Number(selectLevel.answer)).send({from : account, gas: 500000})
                if(successMarket) {
                  await client.patch(questId).set({
                    statusType: 'SUCCESS',
                    questStatus: 'SUCCESS',
                    successTx: successMarket.transactionHash,
                    successDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                    updateMember: account,
                  }).commit();
                }
                const charityFee = successMarket.events.SuccessMarket.returnValues.charityFee;
                const changeCharityFee = Number(web3.utils.fromWei(charityFee, 'ether'));
                await client.patch(governanceId).set({reward: changeCharityFee}).commit();
                setSelectLevel({...selectLevel, status: 'SUCCESS', charity: changeCharityFee});
                setDraftModal(true);
                setLoading(false);
              }
            } catch (err) {
              toastNotify({
                state: 'error',
                message: `Failed Answer SuccessMarket Quest`,
              });
              setDraftModal(false);
              setLoading(false);
              return;
            }

            try {
              if(list.answerResult && list.quest.statusType === 'SUCCESS' && list.level === 'answer') {
                setDraftModal(false);
                setLoading(true);
                const setTotalReward = await GovernanceContract().methods.setTotalReward(questKey, (selectLevel.charity * 100)).send({from : account, gas: 500000})
                if(setTotalReward) {
                  await client.patch(governanceId).set({level: 'done'}).commit();
                  toastNotify({
                    state: 'success',
                    message: `Success Answer End Quest`,
                  });
                  setLoading(false);
                }
              }
            } catch {
              toastNotify({
                state: 'error',
                message: `Failed Answer End Quest`,
              });
              setDraftModal(false);
              setLoading(false);
              return;
            }
          }
        } catch {
          toastNotify({
            state: 'error',
            message: `Failed Set Quest.`,
          });
          setDraftModal(false)
        }
      }
    }
  } catch(err) {
    console.log(err)
  }
}

export const resultModalHandler = (setDraftModal, setSelectLevel, level, _id, list) => {
  setDraftModal(true)
  const result = list.level === 'draft' ? list.draftResult : list.level === 'success' ? list.successResult : list.level === 'answer' ? list.answerResult : null

  if(list.level === 'answer') {
    setSelectLevel({level: level, _id: _id, answer: result, status: list.quest.statusType, charity: list.reward})
  } else {
    setSelectLevel({level: level, _id: _id, result: result})
  }
}

export const cancelModalHandler = (setDraftModal, setSelectLevel, level, _id, list, e) => {
  setDraftModal(true)
  const result = list.level === 'draft' ? list.draftResult : list.level === 'success' ? list.successResult : list.level === 'answer' ? list.answerResult : null

  if(e.target.innerText.includes('Cancel')) {
    setSelectLevel({level: level, _id: _id, result: result, cancel: true})
    return;
  }
}