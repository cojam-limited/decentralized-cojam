import { client } from "../../../sanity";
import { NftContract, GovernanceContract } from "../contractHelper";
import toastNotify from '@utils/toast';

export const voteGovernance = async (diff, level, questKey, answer, _id) => {
  const accounts = await window.klaytn.enable()
  const account = accounts[0];
  const balance = await NftContract().methods.balanceOf(account).call();

  if(diff < 0) {
    toastNotify({
      state: 'error',
      message: `The ${level} Quest Is Closed.`,
    });
    return;
  }

  if(Number(balance) <= 0) {
    toastNotify({
      state: 'error',
      message: 'You Need Membership NFT',
    })
    return;
  }

  try {
    if(level === 'draft') {
      const receipt = await GovernanceContract().methods.voteQuest(questKey, answer).send({from : account})
      const returnValue = receipt?.events?.VoteQuestCast?.returnValues;
  
      const GovernanceItemVoteCreate = {
        _type: 'governanceItemVote',
        governanceItemId: _id,
        voter: returnValue.voter.toLowerCase(),
        draftOption: returnValue.answer,
        draftCount: returnValue.votedNfts.length,
        draftTxHash: receipt?.transactionHash,
        archive: true,
        rewardStatus: false,
      }
  
      await client.create(GovernanceItemVoteCreate);
  
      // update draft total amount
      const newDraftTotalQuery = `*[_type == 'governanceItem' && references('${_id}') && _id != '${Date.now()}']`;
      await client.fetch(newDraftTotalQuery).then(async (vote) => {
        const questId = vote[0]._id;
  
        if(answer === 'approve') {
          await client.patch(questId).inc({approveTotalVote: returnValue.votedNfts.length}).commit();
          toastNotify({
            state: 'success',
            message: `${returnValue.votedNfts.length} Votes to Approve this Quest.`,
          });
        } else if(answer === 'reject') {
          await client.patch(questId).inc({rejectTotalVote: returnValue.votedNfts.length}).commit();
          toastNotify({
            state: 'success',
            message: `${returnValue.votedNfts.length} Votes to Reject this Quest.`,
          });
        }
      });
    } else if (level === 'success') {
      const receipt = await GovernanceContract().methods.voteDecision(questKey, answer).send({from : account})
      const returnValue = receipt?.events?.VoteDecisionCast?.returnValues;
      console.log('receipt', receipt)
      console.log('return', returnValue)
      const SuccessAnswerQuery = `*[_type == 'governanceItemVote' && governanceItemId == '${_id}' && voter == '${account.toLowerCase()}' && _id != '${Date.now()}']`;
      await client.fetch(SuccessAnswerQuery).then(async (list) => {
        await client.patch(list[0]._id).set(
          {
            successOption: returnValue.answer,
            successCount: returnValue.votedNfts.length,
            successTxHash: receipt.transactionHash,
          }
        ).commit();
      })
  
      // update draft total amount
      const SuccessTotalQuery = `*[_type == 'governanceItem' && references('${_id}') && _id != '${Date.now()}']`;
      await client.fetch(SuccessTotalQuery).then(async (vote) => {
        console.log('vote', vote);
        const questId = vote[0]._id;
  
        if(answer === 'success') {
          await client.patch(questId).inc({successTotalVote: returnValue.votedNfts.length}).commit();
          toastNotify({
            state: 'success',
            message: `${returnValue.votedNfts.length} Votes to Success this Quest.`,
          });
        } else if(answer === 'adjourn') {
          await client.patch(questId).inc({adjournTotalVote: returnValue.votedNfts.length}).commit();
          toastNotify({
            state: 'success',
            message: `${returnValue.votedNfts.length} Votes to Adjourn this Quest.`,
          });
        }
      });
    }
  } catch(err) {
    toastNotify({
      state: 'error',
      message: 'Check Your Wallet Account',
    });
  }
};