import Web3 from "web3"
import ProposalABI from "./ABI/ProposalABI.json"
import NftABI from "./ABI/NftContractABI.json"
const nodes = {
    8217 : 'https://public-node-api.klaytnapi.com/v1/cypress',
    1001 : 'https://public-node-api.klaytnapi.com/v1/baobab',
}

/**
 * Web3 instance setting & Contract setting
 */
const createWeb3Instance = () => {
    const provider = window.klaytn ? window.klaytn : nodes[process.env.REACT_APP_CHAIN_ID];

    return new Web3(provider);
}
const getSigner = () => {
    return window.klaytn?.selectedAddress
}

const getProposalContract = () => {
    const web3 = createWeb3Instance();
    return new web3.eth.Contract(ProposalABI, '0x22153d9E5d7A2836098A80CA8f084E0f6b91A61b');
}
const getDaoNftContract = () => {
    const web3 = createWeb3Instance();
    return new web3.eth.Contract(NftABI, '0x0B31464154907aa2B4366a02803AbEACcE979e5C');
}
// ===============Proposal methods====================
/**
 * get one proposal result
 * [proposalKey, title, result, totalVote, resultVote, endTime]
 * @param {number} proposalKey
 * @returns array
 */
export const getProposalResult = async (proposalKey) => {
    const proposalContract = getProposalContract();
    try {
        return await proposalContract.methods.getProposalResult(proposalKey).call();
    }catch (err) {
        console.error('getProposalResult', err);
    }
}
/**
 * Get number of proposal results that saved on the block chain as big number
 * @returns {string}
 */
export const getCountProposalResult = async () => {
    const proposalContract = getProposalContract();
    try {
        return await proposalContract.methods.getTotal().call();
    }catch (err) {
        console.error('getCountProposalResult', err);
    }
}

/**
 * get All proposal keys that has saved on the block
 * @returns {string|Array}
 */
export const getAllProposalKeys = async () => {
    const proposalContract = getProposalContract();
    try {
        return await proposalContract.methods.getAllProposals().call();
    }catch (err) {
        console.error('getAllProposalKeys', err);
    }
}
/**
 * make transaction as proposal result
 * @param {*|Object} params
 * @returns {*|Object} {transactionHash, receipt}
 */
export const setProposal = async ({proposalKey, title, result, totalVote, resultVote, endTime}) => {
    const signer = getSigner();
    const proposalContract = getProposalContract();

    try {
        return await proposalContract.methods.setResult(proposalKey, title, result, totalVote, resultVote, endTime).send({from : signer});
    }catch (err) {
        console.error('SetProposalResult', err);
    }
}
// ===============Nft methods====================
/**
 * get all my nft as token_id
 * @returns {(string|Array)}
 */
export const getAllMyNfts = async () => {
    const msgSender = await getSigner();
    const nftContract = getDaoNftContract();
    try {
        return await nftContract.methods.walletOfOwner(msgSender).call();
    }catch (err) {
        console.error('getAllMyNfts', err);
    }
}

export const getBalance = async () => {
    const msgSender = await getSigner();
    const nftContract = getDaoNftContract();
    try {
        return await nftContract.methods.balanceOf(msgSender).call();
    }catch (err) {
        console.error('getBalance', err);
    }
}
