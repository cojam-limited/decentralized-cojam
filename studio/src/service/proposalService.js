import { client } from "../../../sanity";
import { getAllMyNfts } from "../../../api/UseWeb3";
import { uniqueElementsBetweenArr } from "@utils/argsHelper";

const getResult = () => {
    return {
        ok : false,
        nfts : null,
        msg : ''
    }
}

export async function isAvailabeToVote(_proposalKey, _voter) {
    const result = getResult()
    const votersNft = await getAllMyNfts()
    if(votersNft.length === 0) {
        result.msg = 'voter does not have dao nft';
        return result;
    }
    //if voter has more than 5 nfts just cut from first of array
    const filterNft = votersNft.length > 5 ? votersNft.slice(0,5) : votersNft

    //if voter address is already set on proposalVote return false
    const existVoteGroq = `count(*[_type == "proposalVote" && proposalKey == ${_proposalKey} && voter == '${_voter}'])`
    const checkVoter = await client.fetch(existVoteGroq)
    if(checkVoter !== 0) {
        result.msg = 'already voted wallet address';
        return result;
    }

    //check voter has avaliable nfts to vote proposal
    const groq = `*[_type == "proposal" && proposalKey == ${_proposalKey}]{votedNfts}[0]`
    const proposal = await client.fetch(groq)
    const votableNft = uniqueElementsBetweenArr(filterNft, proposal.votedNfts)
    if(votableNft.length === 0) {
        result.msg = 'voter does not have available dao nft';
        return result;
    }

    result.ok = true;
    result.nfts = votableNft;

    return result
}
