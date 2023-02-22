import { client } from "../../../sanity";
import { MarketContract, GovernanceContract } from "../contractHelper";
import toastNotify from '@utils/toast';
import Moment from 'moment';

export const makeConfirm = async (e, level, _id, list, selectLevel, setSelectLevel, setLoading, render, setRender, setMakeSelect, setDraftModal) => {

  setMakeSelect(false);
  setLoading(true);

  try {
    const accounts = await window.klaytn.enable();
    const account = accounts[0];

    const newDraftTotalQuery = `*[_type == 'governanceItem' && references('${selectLevel._id}') && _id != '${Date.now()}']
    {
      ...,
      'questKey': *[_type == 'quests' && _id == ^.questKey._ref && _id != '${Date.now()}'][0]
    }`;
    client.fetch(newDraftTotalQuery).then(async (vote) => {
      console.log(vote);
      const marketKey = vote[0].questKey.questKey;
      const creator = vote[0].questKey.creatorAddress;
      const title = vote[0].questKey.titleKR;
      const creatorFee = Number(vote[0].questKey.creatorPay) / 10 ** 18;
      const creatorFeePercentage = vote[0].questKey.creatorFee;
      const cojamFeePercentage = vote[0].questKey.cojamFee;
      const charityFeePercentage = vote[0].questKey.charityFee;
      const answer = e.target.innerText.toLowerCase();
      const questKey = vote[0].questKey.questKey;
      const questId = vote[0].questKey._id;
      const governanceId = vote[0]._id;

      const answerKeyQuery = `*[_type == 'questAnswerList' && questKey == ${questKey} && _id != '${Date.now()}']`;
      const answerKeyList = [];
      await client.fetch(answerKeyQuery).then((answers) => {
        console.log(answers);
        answers.forEach((answer) => {
          console.log(answer)
          answerKeyList.push(answer.questAnswerKey);
        });
      });

      if(level === 'draft') {
        setDraftModal(false);
        try {
          if(!list.draftResult) {
            const receipt = await GovernanceContract().methods.makeQuestResult(questKey, answer).send({from : account, gas: 500000})
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
                setRender(!render);
                setLoading(false);
                return;
              }
            } catch (err) {
              toastNotify({
                state: 'error',
                message: `Failed Reject Draft End Quest`,
              });
              setRender(!render);
              setLoading(false);
              return;
            }
  
            setDraftModal(true);
            setRender(!render);
            setLoading(false);
            return;
          }
        } catch (err) {
          toastNotify({
            state: 'error',
            message: `Failed Draft End Quest`,
          });
          setRender(!render);
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
              approveDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
              updateMember: account,
            }).commit();
            await client.patch(governanceId).set({level: 'draftEnd'}).commit();
            toastNotify({
              state: 'success',
              message: `Approve Draft End Quest`,
            });
            setRender(!render);
            setSelectLevel(null);
          }
        } catch (err) {
          toastNotify({
            state: 'error',
            message: `Failed Approve Draft End Quest`,
          });
          setRender(!render);
          setLoading(false);
          return;
        }
      }

      if(level === 'success') {
        setDraftModal(false);
        if(!list.successResult) {
          try {
            const receipt = await GovernanceContract().methods.makeDecisionAndExecuteAnswer(questKey, answer, answerKeyList).send({from : account, gas: 500000})
            console.log('SDAEA', receipt);
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
                setRender(!render);
                setLoading(false);
                return;
              }
            } catch (err) {
              toastNotify({
                state: 'error',
                message: `Failed Success End Quest`,
              });
              setRender(!render);
              setLoading(false);
              return;
            }
          } catch (err) {
            toastNotify({
              state: 'error',
              message: `Failed End Quest`,
            });
            setRender(!render);
            setLoading(false);
            return;
          }

          setDraftModal(true);
          setRender(!render);
          setLoading(false);
          return;
        }

        if(list.successResult === 'adjourn') {
          setDraftModal(false);
          try {
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
              setRender(!render);
              setLoading(false);
              return;
            }
          } catch (err) {
            toastNotify({
              state: 'error',
              message: `Failed Adjourn End Quest`,
            });
            setRender(!render);
            setLoading(false);
            return;
          }
        }
      }
    })
  } catch (err) {
    console.log(err)
    toastNotify({
      state: 'error',
      message: `Failed Make Quest`,
    });
    setDraftModal(false);
    setRender(!render);
    setLoading(false);
  }
}