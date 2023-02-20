import { client } from "../../../sanity";
import { GovernanceContract } from "../contractHelper";
import Moment from 'moment';
import toastNotify from '@utils/toast';

export const questEndTime = async (level, questKey, governanceId, setNowTime) => {
  const accounts = await window.klaytn.enable();
  const account = accounts[0];

  try {
    if(level === "draft") {
      const receipt = await GovernanceContract().methods.setQuestEndTime(questKey).send({from : account})
      if(receipt) {
        await client.patch(governanceId).set({draftEndTime: Moment().format("yyyy-MM-DD HH:mm:ss")}).commit();
      }
    }
  
    if(level === "success") {
      const receipt = await GovernanceContract().methods.setDecisionEndTime(questKey).send({from : account})
      if(receipt) {
        await client.patch(governanceId).set({successEndTime: Moment().format("yyyy-MM-DD HH:mm:ss")}).commit();
      }
    }
    
    if(level === "answer") {
      const receipt = await GovernanceContract().methods.setAnswerEndTime(questKey).send({from : account})
      if(receipt) {
        await client.patch(governanceId).set({answerEndTime: Moment().format("yyyy-MM-DD HH:mm:ss")}).commit();
      }
    }
    setNowTime(new Date());
    toastNotify({
      state: 'success',
      message: `Success ${level} Quest Time End.`,
    });
  } catch (err) {
    toastNotify({
      state: 'error',
      message: `Failed ${level} Quest Time End.`,
    });
  }
}