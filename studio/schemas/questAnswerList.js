export default {
    name: "questAnswerList",
    title: "QuestAnswerList",
    type: "document",
    fields: [
      {
        name: "title",
        title: "title",
        type: "string",
      },
      {
        name: "questAnswerKey",
        title: "QuestAnswerKey",
        type: "number",
      },
      {
        name: "questKey",
        title: "QuestKey",
        type: "number",
      },
      {
        name: "questExample",
        title: "Quest Example",
        type: "string",
      },
      {
        name: "selected",
        title: "selected",
        type: "boolean",
      },
      {
        name: "totalAmount",
        title: "Total Amount",
        type: "number",
      },
      {
        name: "totalVotes",
        title: "Total Votes",
        type: "number",
        description: "total votes from the DAO member"
      },
      {
        name: "userCnt",
        title: "User Cnt",
        type: "number",
      },
      {
        name: "color",
        title: "Answer Color List",
        description: "Pick a color",
        type: "colorlist", // required
        options: {
          list: [
            { title: "Red", value: "#ef168f" },
            { title: "Purple", value: "#8950fc" },
            { title: "Gray", value: "#aca0cc" },
            { title: "Green", value: "#bdcdcb" },
            { title: "White", value: "white" },
            { title: "CornflowerBlue", value: "#6495ED" },
            { title: "Black", value: "black" },
            { title: "AnticqueWhite", value: "#FAEBD7" },
            { title: "Azure", value: "#F0FFFF" },
            { title: "Gold", value: "#FFD700" }
          ]
        }
      }
    ],
  };
  