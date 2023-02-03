import { client } from "../../../sanity";
import { getAllMyNfts } from "../../../api/UseWeb3";
import { uniqueElementsBetweenArr } from "../maker";

class ProposalServiceError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ProposalServiceError';
    }
}

const isOverEndTime = (endTime) => {
    const date = new Date(endTime);
    const timestamp = date.getTime()
    if(timestamp < Date.now()) return true;
}
/**
 * Check is availabe to vote on the proposal
 * 1. Does the proposal is on going?
 * 2. Does voter has Dao nft?
 * 3. Did voter already vote to the proposal?
 * 4. Have been used nfts on the proposal?
 * @param {number} _proposalKey
 * @param {string} _voter
 * @returns {string|Array} votableNfts
 */
export async function isAvailableToVote(_proposalKey, _voter) {
    //check voter has avaliable nfts to vote proposal and check End Time
    const groq = `*[_type == "proposal" && proposalKey == ${_proposalKey} && _id != '${Date.now()}']{votedNfts, endTime}[0]`
    const proposal = await client.fetch(groq)
    if(isOverEndTime(proposal.endTime)) throw new ProposalServiceError('proposal vote time is over');

    const votersNft = await getAllMyNfts()
    if(votersNft.length === 0) throw new ProposalServiceError('voter does not have dao nft');
    //if voter has more than 5 nfts just cut from first of array
    const filterNft = votersNft.length > 5 ? votersNft.slice(0,5) : votersNft

    //if voter address is already set on proposalVote return false
    const existVoteGroq = `count(*[_type == "proposalVote" && proposalKey == ${_proposalKey} && voter == '${_voter}' && _id != '${Date.now()}'])`
    const checkVoter = await client.fetch(existVoteGroq)
    if(checkVoter !== 0) throw new ProposalServiceError('already voted wallet address');

    const votableNfts = proposal.votedNfts === null ? filterNft : uniqueElementsBetweenArr(filterNft, proposal.votedNfts)
    if(votableNfts.length === 0) throw new ProposalServiceError('voter does not have available dao nft');

    return votableNfts;
}
