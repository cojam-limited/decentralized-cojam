import { client } from "../../../sanity";
import { keyMaker, setEndTime } from "../maker";

export const Proposal = {
    create : async (title, description, options, creator) => {
        const doc = {
            _type: 'proposal',
            proposalKey: await keyMaker('proposal'),
            title: title,
            description: description,
            options: options,
            creator: creator,
            endTime: setEndTime(3)
        }
        const proposal = await client.create(doc);
        //create proposal options constraint key with proposal_id
        for(const option of options) {
            await client.create({
                _type: 'proposalOptionList',
                option: option,
                proposalId: proposal._id,
                total : 0
            })
        }
        return true;
    },
    vote : async (proposerId, proposalKey, proposalOPtionId, voter, votableNfts) => {
        const doc = {
            _type: 'proposalVote',
            proposalKey: proposalKey,
            proposalOptionId: proposalOPtionId,
            voter: voter,
            count: votableNfts.length
        }

        await client.patch(proposerId).setIfMissing({votedNfts: []}).append('votedNfts', votableNfts).commit({autoGenerateArrayKeys: true})
        await client.patch(proposalOPtionId).inc({total : votableNfts.length}).commit()
        await client.create(doc);
        return true;
    },
    listClosed : async () => {
        const query = `
        *[
            _type == 'proposal' &&
            dateTime(endTime) < dateTime(now())
        ]| order(_createdAt desc)[0..1]
        {
            _id,
            _createdAt,
            proposalKey,
            title,
            description,
            creator,
            endTime,
            "options": *[_type == 'proposalOptionList' && proposalId == ^._id]
        }`
        return await client.fetch(query);
    },
    listClosedPaged : async (lastCreatedAt, lastId) => {
        const query = `
        *[
            _type == 'proposal' &&
            dateTime(endTime) < dateTime(now()) &&
            (
                dateTime(_createdAt) < dateTime('${lastCreatedAt}') ||
                (dateTime(_createdAt) == dateTime('${lastCreatedAt}') && _id > ${lastId})
            )
        ]| order(_createdAt desc)[0..1]
        {
            _id,
            _createdAt,
            proposalKey,
            title,
            description,
            creator,
            endTime,
            "options": *[_type == 'proposalOptionList' && proposalId == ^._id]
        }`
        return await client.fetch(query);
    },
    listOpen : async () => {
        const query = `
        *[
            _type == 'proposal' &&
            dateTime(endTime) > dateTime(now())
        ]| order(endTime)[0..1]
        {
            _id,
            _createdAt,
            proposalKey,
            title,
            description,
            creator,
            endTime
        }`
        return await client.fetch(query);
    },
    listOpenPaged : async (lastEndTime, lastId) => {
        const query = `
        *[
            _type == 'proposal' &&
            dateTime(endTime) > dateTime(now()) &&
            (
                dateTime(endTime) > dateTime('${lastEndTime}') ||
                (dateTime(endTime) == dateTime('${lastEndTime}') && _id > ${lastId})
            )
        ]| order(endTime)[0..1]
        {
            _id,
            _createdAt,
            proposalKey,
            title,
            description,
            creator,
            endTime
        }`
        return await client.fetch(query);
    },
    listAll : async () => {
        const query = `
        *[ _type == 'proposal']| order(_createdAt desc)[0..2]
        {
            _id,
            _createdAt,
            proposalKey,
            title,
            description,
            creator,
            endTime,
            dateTime(endTime) < dateTime(now()) => {
                "options": *[_type == 'proposalOptionList' && proposalId == ^._id]
            }
        }`
        return await client.fetch(query);
    },
    listAllPaged : async (lastCreatedAt, lastId) => {
        const query = `
        *[
            _type == 'proposal' &&
            (
                dateTime(_createdAt) < dateTime('${lastCreatedAt}') ||
                (dateTime(_createdAt) == dateTime('${lastCreatedAt}') && _id > ${lastId})
            )
        ]| order(_createdAt desc)[0..2]
        {
            _id,
            _createdAt,
            proposalKey,
            title,
            description,
            creator,
            endTime,
            dateTime(endTime) < dateTime(now()) => {
                "options": *[_type == 'proposalOptionList' && proposalId == ^._id]
            }
        }`
        return await client.fetch(query);
    },
    view : async (proposalKey) => {
        const query = `
        *[
            _type == 'proposal' &&
            proposalKey == ${proposalKey}
        ]
        {
            _id,
            proposalKey,
            title,
            description,
            creator,
            endTime,
            "options" : *[_type == 'proposalOptionList' && proposalId == ^._id],
        }[0]`
        return await client.fetch(query);
    },
    voteList : async (proposalKey) => {
        const query = `
        *[
            _type == 'proposalVote' &&
            proposalKey == ${proposalKey}
        ]| order(_createdAt desc)[0..1]
        {
            _id,
            _createdAt,
            proposalOptionId,
            voter,
            count,
            "option" : *[_type == 'proposalOptionList' && _id == ^.proposalOptionId].option,
        }`
        return await client.fetch(query);
    },
    voteListPaged : async (proposalKey, lastCreatedAt, lastId) => {
        const query = `
        *[
            _type == 'proposalVote' &&
            proposalKey == ${proposalKey} &&
            (
                dateTime(_createdAt) < dateTime('${lastCreatedAt}') ||
                (dateTime(_createdAt) == dateTime('${lastCreatedAt}') && _id > ${lastId})
            )
        ]| order(_id)[0..1]
        {
            _id,
            _createdAt,
            proposalOptionId,
            voter,
            count,
            "option" : *[_type == 'proposalOptionList' && _id == ^.proposalOptionId].option,
        }`
        return await client.fetch(query);
    }
}