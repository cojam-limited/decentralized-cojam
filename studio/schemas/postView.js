export default {
  name: "postView",
  title: "postView",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
    },
    {
      name: "description",
      title: "Description",
      type: "text",
    },
    {
      name: "related",
      title: "Related posts",
      type: "array",
      of: [ {type: "post"} ]
    }
  ],
};
