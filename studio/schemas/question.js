export default {
  name: "question",
  title: "Question",
  type: "document",
  fields: [
    {
      name: "question",
      title: "Question",
      type: "string",
    },
    {
      name: "answer",
      title: "Answer",
      type: "string",
    },
    {
      name: "opYn",
      title: "Op Yn",
      type: "string",
    },
    {
      name: "orderNumber",
      title: "Order Number",
      type: "string",
    },
    {
      name: "createMember",
      title: "Create Member",
      type: 'reference',
      to: [{type: "member"}]
    },
    {
      name: "createDateTime",
      title: "Create DateTime",
      type: "datetime",
    },
    {
      name: "updateMember",
      title: "Update Member",
      type: 'reference',
      to: [{type: "member"}]
    },
    {
      name: "updateDateTime",
      title: "Update DateTime",
      type: "datetime",
    },
  ],
};
