import Web3 from "web3";
import GovernanceContractABI from "../../api/ABI/GovernanceContractABI.json"
import NftContractABI from "../../api/ABI/NftContractABI.json"
import MarketContractABI from "../../api/ABI/CojamMarketContractABI.json"

const web3 = new Web3(window.klaytn);

const governanceContractAddress = '0xFa7dfdC06c641Efc2F9d1E38E8010D0D521297B6';
const nftContractAddress = '0x0B31464154907aa2B4366a02803AbEACcE979e5C';
const marketContractAddress = '0x6b24afa82775414a8c3778aa8d480587021ba6c8';

export const NftContract = () => {
  return new web3.eth.Contract(NftContractABI, nftContractAddress)
}

export const MarketContract = () => {
  return new web3.eth.Contract(MarketContractABI, marketContractAddress)
}

export const GovernanceContract = () => {
  return new web3.eth.Contract(GovernanceContractABI, governanceContractAddress) 
}