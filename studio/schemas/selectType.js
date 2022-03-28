export default {
    name: 'selectType',
    title: 'Select A Type',
    type: 'document',
    fields: [
        {
            name: "type",
            title: "Type",
            type: "string",
          },
        {
            name: 'bet',
            title: 'bet',
           type:'array',
           of: [  {
            type: 'reference',
            to: [
              {type: 'bet'}
            ]
          }]
},

    ]
}