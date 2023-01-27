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
      name: "draftStartTime",
      title: "Draft Start Time",
      type: "datetime"
    },
    {
      name: "successStartTime",
      title: "Success Start Time",
      type: "datetime"
    },
    {
      name: "answerStartTime",
      title: "Answer Start Time",
      type: "datetime"
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
      name: "approveTotalVote",
      title: "Draft Approve Total votes",
      type: "number"
    },
    {
      name: "rejectTotalVote",
      title: "Draft Reject Total votes",
      type: "number"
    },
    {
      name: "successTotalVote",
      title: "Success Total Vote",
      type: "number"
    },
    {
      name: "adjournTotalVote",
      title: "Adjourn Total Vote",
      type: "number"
    },
    {
      name: "answerTotalVote",
      title: "Answer Total Vote",
      type: "number"
    },
  ],
};