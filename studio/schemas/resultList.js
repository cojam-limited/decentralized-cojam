export default {
  name: "resultList",
  title: "ResultList",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
    },
    {
      name: "type",
      title: "Type",
      type: "string",
    },
    {
      name: "mainImage",
      title: "Main image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "postDate",
      title: "Post Date",
      type: "datetime",
    },
    {
      name: "description",
      title: "Description",
      type: "text",
    },
    {
      name: "isActive",
      title: "isActive",
      type: "boolean",
    },
    {
      name: "related",
      title: "Related posts",
      type: "array",
      of: [ 
        { type: "reference",
          to: [{type: 'resultList'}]
        } 
      ]
    }
  ],
};
