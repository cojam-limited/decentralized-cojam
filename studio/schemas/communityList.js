export default {
  name: "communityList",
  title: "CommunityList",
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
  ],
};
