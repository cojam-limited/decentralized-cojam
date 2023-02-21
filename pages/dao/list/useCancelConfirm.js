import { client } from "../../../sanity";
import { MarketContract, GovernanceContract } from "../contractHelper";
import toastNotify from '@utils/toast';
import Moment from 'moment';

export const cancelConfirm = async (diff, governanceId, questKey, questId, setLoading, render, setRender, setDraftModal, list, setSelectLevel) => {
  console.log(list)
  setDraftModal(false);
  setLoading(true);
  const accounts = await window.klaytn.enable();
  const account = accounts[0];
  if(diff < 0) {
    try {
      if(!list.answerResult) {
        const receipt = await GovernanceContract().methods.cancelAnswer(questKey, '').send({from: account, gas: 500000})
        console.log(receipt)
        const result = receipt.events.AnswerCancel.returnValues.questKey;
        setSelectLevel({level: list.level, _id: list.quest._id, questKey: result})
        await client.patch(governanceId).set({answerResult: result}).commit();
        setDraftModal(true);
        setRender(!render);
        setLoading(false);
        return;
      }

      if(list.answerResult && list.quest.statusType !== 'ADJOURN') {
        setDraftModal(false);
        setLoading(true);
        await client.patch(governanceId).set({level: 'cancel'}).commit();
        const adjourn = await MarketContract().methods.adjournMarket(questKey).send({from : account, gas: 500000})
        console.log(adjourn)
        const approveListQuery = `*[_type == 'quests' && _id == '${questId}' && _id != '${Date.now()}']`
        client.fetch(approveListQuery).then(async (list) => {
          console.log('list', list)
          await client.patch(list[0]._id).set({
            statusType: 'ADJOURN',
            questStatus: 'ADJOURN',
            adjournTx: adjourn.transactionHash,
            adjournDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
            updateMember: account,
          }).commit();
          toastNotify({
            state: 'success',
            message: `Success Cancel Quest`,
          });
        })
      }
      setRender(!render);
      setLoading(false)
    } catch (err) {
      console.log(err);
      toastNotify({
        state: 'error',
        message: `Failed Cancel Quest`,
      });
      setRender(!render);
      setLoading(false)
    }
  }
}