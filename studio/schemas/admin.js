export default {
    name: 'admin',
    title: 'Admin',
    type: 'document',
    fields: [
        {
            name: 'walletAddress',
            title: 'Wallet Address',
            type: 'string',
        },
        {
            name: 'active',
            title: 'Active',
            type: 'boolean'
        },
        {
            name: 'createdDateTime',
            title: 'Created DateTime',
            type: 'datetime',
        },
        {
            name: 'updateDateTime',
            title: 'Update DateTime',
            type: 'datetime',
        },
    ]
}