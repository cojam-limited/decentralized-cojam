export default {
    name: 'loginRewardHistory',
    title: 'Login Reward History',
    type: 'document',
    fields: [
        {
            name: 'walletAddress',
            title: 'Wallet Address',
            type: 'string',
        },
        {
            name: 'loginDate',
            title: 'Login Date',
            type: 'date',
        },
        {   
            name: 'rewardAmount',
            title: 'Reward Amount',
            type: 'number'
        },
        {
            name: 'transactionId',
            title: 'Transaction Id',
            type: 'string',
        },
        {
            name: 'createdDateTime',
            title: 'Create DateTime',
            type: 'datetime',
        },
    ]
}