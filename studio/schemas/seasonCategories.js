export default {
  name: 'seasonCategories',
  title: 'Season Categories',
  type: 'document',
  fields: [
    {
      name: 'seasonCategoryName',
      title: 'Season Category Name',
      type: 'string',
    },
    {
      name: 'season',
      title: 'Season',
      type: 'string',
    },
    {
      name: 'limitation',
      title: 'Limitation',
      type: 'string',
    },
    {
      name: 'orderNumber',
      title: 'Order Number',
      type: 'number',
    },
    {
      name: 'createMemeber',
      title: 'Create Memeber',
      type: 'reference',
      to: [{type: "member"}]
    },
    {
      name: 'createdDateTime',
      title: 'Create DateTime',
      type: 'datetime',
    },
    {
      name: 'updateMemeber',
      title: 'Update Memeber',
      type: 'reference',
      to: [{type: "member"}]
    },
    {
      name: 'updateDateTime',
      title: 'Update DateTime',
      type: 'datetime',
    },
  ],
}
