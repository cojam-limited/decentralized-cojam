export default {
    name: 'joinRewardHistory',
    title: 'Join Reward History',
    type: 'document',
    fields: [
        {
            name: 'walletAddress',
            title: 'Wallet Address',
            type: 'string',
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