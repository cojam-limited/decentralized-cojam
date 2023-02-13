import { client } from "../../../sanity";
import { MarketContract, GovernanceContract } from "../contractHelper";
import toastNotify from '@utils/toast';
import Moment from 'moment';

export const cancelConfirm = async (diff, governanceId, questKey, questId, setLoading, render, setRender) => {
  setLoading(true);
  if(diff < 0) {
    try {
      const accounts = await window.klaytn.enable();
      const account = accounts[0];
      const receipt = await GovernanceContract().methods.cancelAnswer(questKey, '').send({from: account, gas: 500000})
      console.log(receipt)
      if(receipt) {
        await client.patch(governanceId).set({level: 'cancel'}).commit();
        const adjourn = await MarketContract().methods.adjournMarket(questKey).send({from : account, gas: 500000})
        console.log(adjourn)
        const approveListQuery = `*[_type == 'quests' && _id == '${questId}' && _id != '${Date.now()}']`
        client.fetch(approveListQuery).then(async (list) => {
          console.log('list', list)
          await client.patch(list[0]._id).set({
            statusType: 'ADJOURN',
            questStatus: 'ADJOURN',
            adjournTx: receipt.transactionHash,
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