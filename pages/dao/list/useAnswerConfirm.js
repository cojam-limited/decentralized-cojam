import { client } from "../../../sanity";
import { GovernanceContract } from "../contractHelper";
import toastNotify from '@utils/toast';

export const answerConfirm = async (questKey, answerKey, answerId, answerTitle, itemId, itemQuestId, setLoading, render, setRender, setSelectedAnswer) => {

  console.log(answerKey)

  setLoading(true);

  if(!answerKey) {
    toastNotify({
      state: 'error',
      message: `Please Check Answer.`,
    });
    setLoading(false)
    return;
  }

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
    setRender(!render);
    setLoading(false);
  }
}