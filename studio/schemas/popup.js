export default {
  name: "popup",
  title: "Pop up",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
    },
    {
      name: "content",
      title: "Content",
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
    {
      name: "isActive",
      title: "isActive",
      type: "boolean"
    },
    {
      name: "createdDateTime",
      title: "Created DateTime",
      type: "datetime"
    }
  ],
};
