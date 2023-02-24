import { client } from "../../../sanity";
import { MarketContract, GovernanceContract } from "../contractHelper";
import toastNotify from '@utils/toast';
import Moment from 'moment';

export const cancelConfirm = async (diff, governanceId, questKey, questId, setLoading, render, setRender, setDraftModal, list, setSelectLevel, selectLevel) => {
  setDraftModal(false);
  setLoading(true);
  console.log(list)
  const accounts = await window.klaytn.enable();
  const account = accounts[0];
  const totalAmount = list.successTotalVote + list.adjournTotalVote
  if(diff < 0 || list.answerTotalVote >= totalAmount) {
    try {
      if(!list.answerResult) {
        const receipt = await GovernanceContract().methods.cancelAnswer(questKey, '').send({from: account, gas: 500000})
        console.log(receipt)
        const result = receipt.events.AnswerCancel;
        setSelectLevel({...selectLevel, result: result, questKey: result.returnValues.questKey})
        await client.patch(governanceId).set({answerResult: result.event}).commit();
        setRender(!render);
        setDraftModal(true);
        setLoading(false);
        return;
      }

      if(list.answerResult && list.quest.statusType !== 'ADJOURN') {
        setDraftModal(false);
        setLoading(true);
        const adjourn = await MarketContract().methods.adjournMarket(questKey).send({from : account, gas: 500000})
        const approveListQuery = `*[_type == 'quests' && _id == '${questId}' && _id != '${Date.now()}']`
        client.fetch(approveListQuery).then(async (list) => {
          await client.patch(list[0]._id).set({
            statusType: 'ADJOURN',
            questStatus: 'ADJOURN',
            adjournTx: adjourn.transactionHash,
            adjournDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
            updateMember: account,
          }).commit();
          await client.patch(governanceId).set({level: 'cancel'}).commit();
          toastNotify({
            state: 'success',
            message: `Success Cancel Quest`,
          });
          setRender(!render);
          setLoading(false)
        })
      }
    } catch (err) {
      console.log(err);
      toastNotify({
        state: 'error',
        message: `Failed Cancel Quest`,
      });
      setRender(!render);
      setLoading(false)
    }
  } else {
    toastNotify({
      state: 'error',
      message: `Failed Cancel Quest`,
    });
  }
}