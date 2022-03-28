export default {
  name: "transactions",
  title: "Transactions",
  type: "document",
  fields: [
    {
      name: "transactionId",
      title: "Transaction Id",
      type: "string",
    },
    {
      name: "transactionType",
      title: "Transaction Type",
      type: "string",
    },
    {
      name: "amount",
      title: "Amount",
      type: "number",
    },
    {
      name: "recipientAddress",
      title: "Recipient Address",
      type: "string"
    },
    {
      name: "spenderAddress",
      title: "Spender Address",
      type: "string",
    },
    {
      name: "createdDateTime",
      title: "Created DateTime",
      type: "datetime"
    }
  ],
};
