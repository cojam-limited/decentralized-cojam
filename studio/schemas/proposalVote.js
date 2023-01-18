export default {
    name: "proposalVote",
    title: "Proposal Vote",
    type: "document",
    fields: [
      {
        name: "proposalKey",
        title: "proposal Key",
        type: "number",
      },
      {
        name: "proposalOptionId",
        title: "Proposal Option ID",
        type: "string",
      },
      {
        name: "voter",
        title: "Voter",
        type: "string",
        description: "Wallet address who loggin in from window.klaytn",
      },
      {
        name: "count",
        title: "Count",
        type: "number",
        description: "how many nft is voted to proposal from ERC-721.balanceOf()"
      },
    ],
  };