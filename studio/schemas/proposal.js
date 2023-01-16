function setEndTime() {
    let currentDate = new Date();
    currentDate.setUTCDate(currentDate.getUTCDate() + 3);
    return currentDate.toISOString();
}

export default {
    name: "proposal",
    title: "Proposal",
    type: "document",
    fields: [
      {
        name: "proposalKey",
        title: "Proposal Key",
        type: "number",
      },
      {
        name: "title",
        title: "Title",
        type: "string",
      },
      {
        name: "description",
        title: "Description",
        type: "string",
      },
      {
        name: "options",
        title: "Options",
        type: "array",
        of: [{type: "string"}]
      },
      {
        name: "creator",
        title: "Creator",
        type: "string",
      },
      {
        name: "endTime",
        title: "End Time",
        type: "datetime",
        readOnly: true,
        initialValue: setEndTime(),
      },
    ],
  };