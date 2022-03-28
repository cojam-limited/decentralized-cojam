export default {
  name: "quests",
  title: "Quests",
  type: "document",
  fields: [
    {
      name: "questKey",
      title: "Quest Key",
      type: "number",
    },
    {
      name: "title",
      title: "title",
      type: "string",
    },
    {
      name: "adjournDateTime",
      title: "Adjourn DateTime",
      type: "datetime",
    },
    {
      name: "adjournTx",
      title: "Adjourn Tx",
      type: "string",
    },
    {
      name: "approveDateTime",
      title: "Approve DateTime",
      type: "datetime",
    },
    {
      name: "approveTx",
      title: "Approve Tx",
      type: "string",
    },
    {
      name: "seasonCategory",
      title: "Season Category",
      type: "reference",
      to: [{type: 'seasonCategories'}]
    },
    {
      name: "startDateTime",
      title: "Start DateTime",
      type: "datetime",
    },
    {
      name: "endDateTime",
      title: "End DateTime",
      type: "datetime",
    },
    {
      name: "endUtcDateTime",
      title: "End UtcDateTime",
      type: "datetime",
    },
    {
      name: "questTitle",
      title: "Quest Title",
      type: "string",
    },
    {
      name: "completed",
      title: "Completed",
      type: "boolean",
    },
    {
      name: "creatorAddress",
      title: "Creator Address",
      type: "string",
    },
    {
      name: "questDesc",
      title: "Quest Desc",
      type: "string",
    },
    {
      name: "hot",
      title: "Hot",
      type: "boolean",
    },
    {
      name: "pending",
      title: "Pending",
      type: "boolean",
    },
    {
      name: "questStatus",
      title: "Quest Status",
      type: "string",
    },
    {
      name: "successDateTime",
      title: "Success DateTime",
      type: "datetime",
    },
    {
      name: "successTx",
      title: "Success Tx",
      type: "string",
    },
    {
      name: "memberKey",
      title: "Member Key",
      type: "string",
    },
    {
      name: "season",
      title: "Season",
      type: "reference",
      to: [{type: 'season'}]
    },
    {
      name: "finishDateTime",
      title: "Finish DateTime",
      type: "string",
    },
    {
      name: "finishTx",
      title: "Finish Tx",
      type: "string",
    },
    {
      name: "retrieveDateTime",
      title: "Retrieve DateTime",
      type: "datetime",
    },
    {
      name: "retrieveTx",
      title: "Retrieve Tx",
      type: "string",
    },
    {
      name: "answersTx",
      title: "Answers Tx",
      type: "string",
    },
    {
      name: "draftDateTime",
      title: "Draft DateTime",
      type: "string",
    },
    {
      name: "draftTx",
      title: "Draft Tx",
      type: "string",
    },
    {
      name: "snsUrl",
      title: "Sns Url",
      type: "string",
    },
    {
      name: "snsId",
      title: "Sns Id",
      type: "string",
    },
    {
      name: "fileKey",
      title: "File Key",
      type: "string",
    },
    {
      name: "answers",
      title: "answers",
      type: "array",
      of: [{type: "string"}]
    },
    {
      name: "createMember",
      title: "Create Member",
      type: "string",
    },
    {
      name: "createDateTime",
      title: "Create DateTime",
      type: "datetime",
    },
    {
      name: "updateMember",
      title: "Update Member",
      type: "string",
    },
    {
      name: "snsType",
      title: "Sns Type",
      type: "string",
    },
    {
      name: "snsDesc",
      title: "Sns Desc",
      type: "string",
    },
    {
      name: "snsTitle",
      title: "Sns Title",
      type: "string",
    },
    {
      name: "categoryName",
      title: "Category Name",
      type: "string",
    },
    {
      name: "orderType",
      title: "Order Type",
      type: "string",
    },
    {
      name: "totalCreatorFee",
      title: "Total Creator Fee",
      type: "string",
    },
    {
      name: "cojamFee",
      title: "Cojam Fee",
      type: "string",
    },
    {
      name: "creatorPay",
      title: "Creator Pay",
      type: "string",
    },
    {
      name: "charityFee",
      title: "Charity Fee",
      type: "string",
    },
    {
      name: "totalCharityFee",
      title: "Total Charity Fee",
      type: "string",
    },
    {
      name: "maximumPay",
      title: "Maximum Pay",
      type: "number",
    },
    {
      name: "minimumPay",
      title: "Minimum Pay",
      type: "number",
    },
    {
      name: "statusType",
      title: "Status Type",
      type: "string",
    },
    {
      name: "description",
      title: "Description",
      type: "string",
    },
    {
      name: "creatorFee",
      title: "Creator Fee",
      type: "string",
    },
    {
      name: "isActive",
      title: "isActive",
      type: "boolean",
    },
    {
      name: "totalAmount",
      title: "Total Amount",
      type: "number",
    },
    {
      name: "answersStr",
      title: "Answers Str",
      type: "string",
    },
    {
      name: "dDay",
      title: "D Day",
      type: "string",
    },
    {
      name: "finished",
      title: "Finished",
      type: "boolean",
    },
    {
      name: "questLanguage",
      title: "Quest Language",
      type: "string",
    },
    {
      name: "marketClosed",
      title: "Market Closed",
      type: "boolean",
    },
    {
      name: "push",
      title: "Push",
      type: "boolean",
    },
    {
      name: "imageLink",
      title: "Image Link",
      type: "string",
    },
    {
      name: "imageFile",
      title: "Image File",
      type: "image",
      options: {
        hotspot: true,
      },
    },
  ],
};
