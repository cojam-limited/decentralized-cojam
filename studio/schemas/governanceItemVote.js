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
      }
    ],
  };