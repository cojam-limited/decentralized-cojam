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
      },
      {
        name: "answerCount",
        title: "Answer Count",
        type: "number",
        description: "how many nft is voted to proposal from ERC-721.balanceOf()"
      },
    ],
  };