import { client } from "../../../sanity";
import { getAllMyNfts } from "../../../api/UseWeb3";
import { uniqueElementsBetweenArr } from "../maker";

const result = (state, msg, data = null) => {
    return {
        state: state,
        message: msg,
        data: data
    }
}
const isOverEndTime = (endTime) => {
    const date = new Date(endTime);
    const timestamp = date.getTime()
    if(timestamp < Date.now()) return true;
}
/**
 *
 * @param {number} _proposalKey
 * @param {string} _voter
 * @returns {Object} state = 'error'||'success' message = error message, data = votable nfts as array
 */
export async function isAvailableToVote(_proposalKey, _voter) {
    const votersNft = await getAllMyNfts()
    if(votersNft.length === 0) return result('error', 'voter does not have dao nft');
    //if voter has more than 5 nfts just cut from first of array
    const filterNft = votersNft.length > 5 ? votersNft.slice(0,5) : votersNft

    //if voter address is already set on proposalVote return false
    const existVoteGroq = `count(*[_type == "proposalVote" && proposalKey == ${_proposalKey} && voter == '${_voter}' && _id != '${Date.now()}'])`
    const checkVoter = await client.fetch(existVoteGroq)
    if(checkVoter !== 0) return result('error', 'already voted wallet address');

    //check voter has avaliable nfts to vote proposal and check End Time
    const groq = `*[_type == "proposal" && proposalKey == ${_proposalKey} && _id != '${Date.now()}']{votedNfts, endTime}[0]`
    const proposal = await client.fetch(groq)
    if(isOverEndTime(proposal.endTime)) return result('error', 'proposal vote time is over');

    const votableNft = proposal.votedNfts === null ? filterNft : uniqueElementsBetweenArr(filterNft, proposal.votedNfts)
    if(votableNft.length === 0) return result('error', 'voter does not have available dao nft');

    return result('success', 'completed!', votableNft);
}
