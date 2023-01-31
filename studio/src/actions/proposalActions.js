import { client } from "../../../sanity";
import { keyMaker, setEndTime } from "../maker";
import { isAvailabeToVote } from "../Service/proposalService";

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
                proposalId: proposal._id
            })
        }
        return true
    },
    vote : async (proposerId, proposalKey, proposalOPtionId, voter) => {
        const {ok, nfts, msg} = await isAvailabeToVote(proposalKey, voter)
        if(!ok) return {ok, msg}

        const doc = {
            _type: 'proposalVote',
            proposalKey: proposalKey,
            proposalOptionId: proposalOPtionId,
            voter: voter,
            count: nfts.length
        }

        await client.patch(proposerId).append('votedNfts', nfts).commit({autoGenerateArrayKeys: true})
        await client.create(doc);

        return {ok, nfts}
    }
}