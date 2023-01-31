export default {
    name: "proposal",
    title: "Proposal",
    type: "document",
    fields: [
      {
        name: "proposalKey",
        title: "Proposal Key",
        type: "number",
        readOnly: true,
      },
      {
        name: "title",
        title: "Title",
        type: "string",
      },
      {
        name: "description",
        title: "Description",
        type: "string",
      },
      {
        name: "options",
        title: "Options",
        type: "array",
        of: [{type: "string"}],
      },
      {
        name: "creator",
        title: "Creator",
        type: "string",
      },
      {
        name: "votedNfts",
        title: "Voted NFTs",
        type: "array",
        of: [{type: "string"}]
      },
      {
        name: "endTime",
        title: "End Time",
        type: "datetime",
        readOnly: true,
      },
    ],
  };