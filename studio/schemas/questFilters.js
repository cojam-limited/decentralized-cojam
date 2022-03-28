export default {
  name: 'questFilters',
  title: 'questFilters',
  type: 'document',
  fields: [
    {
      name: 'menu',
      title: 'Menu',
      type: 'string',
    },
    {
      name: 'questFilter',
      title: 'QuestFilter',
      type: 'array',
      of: [{type: "string"}]
    },
  ],
}
