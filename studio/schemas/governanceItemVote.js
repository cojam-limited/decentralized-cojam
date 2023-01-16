import { client } from "../../sanity";

const isUniqueKey = (voter, context) => {
  const { document } = context;
  const id = document._id.replace(/^drafts\./, '');
  if(!document.governanceItemId) {
    return true;
  }
  const qurey = `!defined(*[_type == 'governanceItemVote' &&
    !(_id in ['drafts.${id}', '${id}']) &&
    governanceItemId == '${document.governanceItemId}' &&
    voter == '${voter}'
  ][0]._id)`;
  return client.fetch(qurey)
}

export default {
    name: "governanceItemVote",
    title: "Governance Item Vote",
    type: "document",
    fields: [
      {
        name: "governanceItemId",
        title: "Governance Item Id",
        type: "string",
      },
      {
        name: "voter",
        title: "Voter",
        type: "string",
        validation: Rule => Rule.custom(async (voter, context) => {
          const check = await isUniqueKey(voter, context)
          if(!check) return `Already Voted by ${voter} on Quest`
          return true
        })
      },
      {
        name: "draftOption",
        title: "Draft Option",
        type: "string",
      },
      {
        name: "successOption",
        title: "Success Option",
        type: "string",
      },
      {
        name: "answerOption",
        title: "Answer Option",
        type: "string",
      },
      {
        name: "draftCount",
        title: "Draft Count",
        type: "number",
      },
      {
        name: "successCount",
        title: "Success Count",
        type: "number",
      },
      {
        name: "answerCount",
        title: "Answer Count",
        type: "number",
      }
    ],
  };