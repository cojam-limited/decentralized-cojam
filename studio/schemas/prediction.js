export default {
  name: "prediction",
  title: "Prediction",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
    },
    {
      name: "category",
      title: "Category",
      type: "string",
    },
    {
      name: "description",
      title: "Description",
      type: "string",
    },
    {
      name: "totalCount",
      title: "TotalCount",
      type: "string",
      options: {
        source: "title",
        maxLength: 96,
      },
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
      name: "votingEnds",
      title: "Voting Ends",
      type: "datetime",
    },
    {
      name: "allocations",
      title: "Allocations",
      type: "array",
      of: [{ type: "allocation" }],
    },
  ],

  preview: {
    select: {
      title: "title",
      author: "user.walletAddress",
      media: "image",
    },
    prepare(selection) {
      const { createdBy } = selection;
      return Object.assign({}, selection, {
        subtitle: createdBy && `by ${createdBy}`,
      });
    },
  },
};
