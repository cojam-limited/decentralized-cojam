export default {
  name: "governanceItem",
  title: "Governance Item",
  type: "document",
  fields: [
    {
      name: "questKey",
      title: "QuestKey",
      type: "reference",
      to: [{type: 'quests'}],
      description: "Which Quest has governance",
    },
    {
      name: "level",
      title: "Level",
      type: "string",
    },
    {
      name: "draftEndTime",
      title: "Draft End Time",
      type: "datetime",
    },
    {
      name: "successEndTime",
      title: "Success End Time",
      type: "datetime",
    },
    {
      name: "answerEndTime",
      title: "Answer End Time",
      type: "datetime",
    },
    {
      name: "draftTotalVote",
      title: "Draft Total Vote",
      type: "number"
    },
    {
      name: "successTotalVote",
      title: "Success Total Vote",
      type: "number"
    },
    {
      name: "answerTotalVote",
      title: "Answer Total Vote",
      type: "number"
    }
  ],
};