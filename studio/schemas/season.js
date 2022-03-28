export default {
  name: "season",
  title: "Season",
  type: "document",
  fields: [
    {
      name: "description",
      title: "Description",
      type: "string",
    },
    {
      name: "seasonCategories",
      title: "Season Categories",
      type: "array",
      of: [{
        type: "reference",
        to: [{type: 'seasonCategories'}]
      }]
    },
    {
      name: "startDate",
      title: "Start Date",
      type: "datetime",
    },
    {
      name: "cojamFee",
      title: "Cojam Fee",
      type: "string",
    },
    {
      name: "charityFee",
      title: "Charity Fee",
      type: "string",
    },
    {
      name: "creatorFee",
      title: "Creator Fee",
      type: "string",
    },
    {
      name: "creatorPay",
      title: "Creator Pay",
      type: "string",
    },
    {
      name: "minimumPay",
      title: "minimumPay",
      type: "string",
    },
    {
      name: "maximumPay",
      title: "Maximum Pay",
      type: "string",
    },
    {
      name: "createdDate",
      title: "Created Date",
      type: "datetime",
    },
    {
      name: "isActive",
      title: "isActive",
      type: "boolean",
    },
    {
      name: "endDate",
      title: "End Date",
      type: "datetime",
    },
    {
      name: "policy",
      title: "Policy",
      type: "string",
    },
    {
      name: "title",
      title: "Title",
      type: "string",
    },
    {
      name: "transferPay",
      title: "Transfer Pay",
      type: "string",
    },
    {
      name: "dDay",
      title: "D Day",
      type: "string",
    },
    {
      name: "ctJson",
      title: "Ct Json",
      type: "string",
    },
  ],
};
