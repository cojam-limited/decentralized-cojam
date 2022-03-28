export default {
    name: 'member',
    title: 'Member',
    type: 'document',
    fields: [
        {
            name: 'memberName',
            title: 'Member Name',
            type: 'string',
        },
        {
            name: 'memberEmail',
            title: 'Member Email',
            type: 'string',
        },
        {
            name: 'delYn',
            title: 'delYn',
            type: 'string',
        },
        {
            name: 'memberPass',
            title: 'Member Pass',
            type: 'string',
        },
        {
            name: 'memberPassConfirm',
            title: 'Member Pass Confirm',
            type: 'string',
        },
        {
            name: 'fpNumber',
            title: 'Fp Number',
            type: 'string',
        },
        {
            name: 'memberRole',
            title: 'Member Role',
            type: 'string',
        },
        {
            name: 'walletAddress',
            title: 'Wallet Address',
            type: 'string',
        },
        {
            name: 'walletLock',
            title: 'Wallet Lock',
            type: 'boolean',
        },
        {
            name: 'lockTransactionId',
            title: 'Lock Transaction Id',
            type: 'string',
        },
        {
            name: 'certification',
            title: 'Certification',
            type: 'boolean',
        },
        {
            name: 'createdDateTime',
            title: 'Created DateTime',
            type: 'datetime',
        },
        {
            name: 'access',
            title: 'Access',
            type: 'boolean',
        },
        {
            name: 'otpUseYn',
            title: 'Otp Use Yn',
            type: 'string',
        },
        {
            name: 'rMemberId',
            title: 'R Member Id',
            type: 'string',
        },
    ]
}