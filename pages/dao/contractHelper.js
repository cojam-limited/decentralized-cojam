import Web3 from "web3";
import GovernanceContractABI from "../../api/ABI/GovernanceContractABI.json"
import NftContractABI from "../../api/ABI/NftContractABI.json"
import MarketContractABI from "../../api/ABI/CojamMarketContractABI.json"

const web3 = new Web3(window.klaytn);

const governanceContractAddress = process.env.REACT_APP_GOVERNANCE_ADDRESS;
const nftContractAddress = process.env.REACT_APP_NFTCONTRACT_ADDRESS;
const marketContractAddress = process.env.REACT_APP_MARKET_ADDRESS;

export const NftContract = () => {
  return new web3.eth.Contract(NftContractABI, nftContractAddress)
}

export const MarketContract = () => {
  return new web3.eth.Contract(MarketContractABI, marketContractAddress)
}

export const GovernanceContract = () => {
  return new web3.eth.Contract(GovernanceContractABI, governanceContractAddress) 
}