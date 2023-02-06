export default {
    name: "governanceItemVote",
    title: "Governance Item Vote",
    type: "document",
    fields: [
      {
        name: "governanceItemId",
        title: "Governance Item Id",
        type: "string",
      },
      {
        name: "voter",
        title: "Voter",
        type: "string",
      },
      {
        name: "draftOption",
        title: "Draft Option",
        type: "string",
      },
      {
        name: "successOption",
        title: "Success Option",
        type: "string",
      },
      {
        name: "answerOption",
        title: "Answer Option",
        type: "string",
      },
      {
        name: "draftCount",
        title: "Draft Count",
        type: "number",
      },
      {
        name: "successCount",
        title: "Success Count",
        type: "number",
      },
      {
        name: "answerCount",
        title: "Answer Count",
        type: "number",
      },
      {
        name: "draftTxHash",
        title: "Draft Transaction Hash",
        type: "string"
      },
      {
        name: "successTxHash",
        title: "Success Transaction Hash",
        type: "string"
      },
      {
        name: "answerTxHash",
        title: "Answer Transaction Hash",
        type: "string"
      },
      {
        name: "archive",
        title: "Archive",
        type : "boolean"
      },
      {
        name: "rewardStatus",
        title: "Reward Status",
        type : "boolean"
      },
    ],
  };