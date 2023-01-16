import { client } from "../../sanity";

const isUniqueKey = (voter, context) => {
  const { document } = context;
  const id = document._id.replace(/^drafts\./, '');
  if(!document.proposalId) {
    return true;
  }
  const qurey = `!defined(*[_type == 'proposalVote' &&
    !(_id in ['drafts.${id}', '${id}']) &&
    proposalId == '${document.proposalId}' &&
    voter == '${voter}'
  ][0]._id)`;
  return client.fetch(qurey)
}

export default {
    name: "proposalVote",
    title: "Proposal Vote",
    type: "document",
    fields: [
      {
        name: "proposalId",
        title: "Proposal ID",
        type: "string",
      },
      {
        name: "votedOption",
        title: "Voted Option",
        type: "string",
      },
      {
        name: "voter",
        title: "Voter",
        type: "string",
        description: "Wallet address who loggin in from window.klaytn",
        validation: Rule => Rule.custom(async (voter, context) => {
          const check = await isUniqueKey(voter, context)
          if(!check) return `Already Voted by ${voter} on proposal`
          return true
        })
      },
      {
        name: "answerCount",
        title: "Answer Count",
        type: "number",
        description: "how many nft is voted to proposal from ERC-721.balanceOf()"
      },
    ],
  };