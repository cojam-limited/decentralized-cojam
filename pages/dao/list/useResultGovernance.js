import { client } from "../../../sanity";
import { MarketContract, GovernanceContract } from "../contractHelper";
import Moment from 'moment';
import toastNotify from '@utils/toast';
import Web3 from "web3";

export const resultGovernance = async (level, _id, diff, answerKey, list, setSelectLevel, setMakeSelect) => {
  console.log(list);
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

  try {
    if(diff < 0) {
      if(totalVote < 10) {
        try {
          if(level === 'draft') {
            const receipt = await GovernanceContract().methods.cancelQuest(questKey).send({from : account})
            if(receipt) {
              await client.patch(governanceId).set({level: 'cancel'}).commit();
            }
            toastNotify({
              state: 'success',
              message: `Success Cancel Quest.`,
            });
          }

          if(level === 'success') {
            const receipt = await GovernanceContract().methods.cancelDecision(questKey).send({from : account})
            if(receipt) {
              const adjourn = await MarketContract().methods.adjournMarket(questKey).send({from : account, gas: 500000})
              if(adjourn) {
                await client.patch(governanceId).set({level: 'cancel'}).commit();
                await client.patch(questId).set({
                  statusType: 'ADJOURN',
                  questStatus: 'ADJOURN',
                  adjournTx: receipt.transactionHash,
                  adjournDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                  updateMember: account,
                }).commit();
                toastNotify({
                  state: 'success',
                  message: `Success Cancel Quest.`,
                });
              }
            }
          }
        } catch (err) {
          console.log(err)
          toastNotify({
            state: 'error',
            message: `Failed Set Quest.`,
          });
          return;
        }
      }

      if(level === 'draft' || level === 'success') {
        if(totalVote >= 10 && agreeVote === disagreeVote) {
          try {
            setSelectLevel({level: level, _id: _id})
            setMakeSelect(true);
            return;
          } catch (err) {
            console.log(err);
            setMakeSelect(false);
            toastNotify({
              state: 'error',
              message: `Failed Set Quest.`,
            });
            return;
          }
        }
      }
      
      if(totalVote >= 10) {
        const answerKeyQuery = `*[_type == 'questAnswerList' && questKey == ${questKey} && _id != '${Date.now()}']`;
        const answerKeyList = [];
        await client.fetch(answerKeyQuery).then((answers) => {
          answers.forEach((answer) => {
            answerKeyList.push(answer.questAnswerKey);
          });
        });

        try {
          if(level === 'draft') {
            const receipt = await GovernanceContract().methods.setQuestResult(questKey).send({from : account, gas: 500000})
            console.log('setQuest', receipt);
            if(receipt.events.QuestResult.returnValues.result === 'approve') {
              await client.patch(governanceId).set({level: 'draftEnd'}).commit();
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
                approveDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                updateMember: account,
              }).commit();
              toastNotify({
                state: 'success',
                message: `Approve Draft End Quest`,
              });
            } else {
              await client.patch(governanceId).set({level: 'reject'}).commit();
              toastNotify({
                state: 'success',
                message: `Reject Draft End Quest`,
              });
            }
          } else if(level === 'success') {
            const receipt = await GovernanceContract().methods.setDecisionAndExecuteAnswer(questKey, answerKeyList).send({from : account, gas: 500000})
            console.log('SDAEA', receipt);
            if(receipt.events.DecisionResult.returnValues.result === 'success') {
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
            } else {
              await client.patch(governanceId).set({level: 'adjourn'}).commit();
              await client.patch(questId).set({
                statusType: 'ADJOURN',
                questStatus: 'ADJOURN',
                approveTx: receipt.transactionHash,
                adjournDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                updateMember: account,
              }).commit();
              toastNotify({
                state: 'success',
                message: `Success Adjourn End Quest`,
              });
            }
          } else if(level === 'answer') {
            if(!answerKey) {
              toastNotify({
                state: 'error',
                message: `Please Check Answer.`,
              });
              return;
            }

            const receipt = await GovernanceContract().methods.setAnswer(questKey, answerKeyList, answerKey).send({from : account, gas: 500000})
            const returnValue = receipt.events.AnswerResult.returnValues;
            const successMarket = await MarketContract().methods.successMarket(Number(returnValue.questKey), Number(returnValue.answer)).send({from : account, gas: 500000})
            console.log(successMarket)
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
            const setTotalReward = await GovernanceContract().methods.setTotalReward(questKey, (changeCharityFee * 100)).send({from : account, gas: 500000})
            console.log(setTotalReward)
            await client.patch(governanceId).set({level: 'done', reward: changeCharityFee}).commit();
            toastNotify({
              state: 'success',
              message: `Success Answer End Quest`,
            });
          }
        } catch (err) {
          console.log(err);
          toastNotify({
            state: 'error',
            message: `Failed Set Quest.`,
          });
        }
      }
    }
  } catch(err) {
    console.log(err)
  }
}