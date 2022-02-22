import Caver from 'caver-js';
import toastNotify from '@utils/toast';
import { mintWithTokenURIABI, mintWithklayABI, proposeMenuABI, voteABI } from '@config/index';
import NFTABI from '@abi/NFT.json';

const caver = new Caver(window.klaytn);
const NFTContract = new caver.contract(NFTABI, process.env.REACT_APP_NFT_CONTRACT_ADDRESS);

export const kaikasLogin = async () => {
  if (typeof window.klaytn !== 'undefined') {
    const accounts = await window.klaytn.enable();
    const account = accounts[0]; // We currently only ever provide a single account,
    console.log(`지갑주소 : ${account}`);
    console.log(`네트워크 주소 : ${window.klaytn.networkVersion}`);
    return account;
  } else {
    toastNotify({
      state: 'error',
      message: 'Please install Kaikas wallet.',
    });
  }
};

export const kaikasGetBalance = async (address) => {
  const balance = await caver.rpc.klay.getBalance(address);
  console.log(`현재 잔액 : ${balance / 10 ** 18}`);
  return balance;
};

export const isKaikasUnlocked = async () => {
  const result = await window.klaytn._kaikas.isUnlocked();
  return result; //잠금상태: false, 열린상태: true
};

export const isKaikasEnabled = async () => {
  const result = await window.klaytn._kaikas.isEnabled();
  return result;
};

export const mintWithTokenURI = async (tokenID, genralTokenURI, masterTokenURI, menuType) => {
  const contract = caver.contract.create([JSON.parse(mintWithTokenURIABI)], process.env.REACT_APP_NFT_CONTRACT_ADDRESS);
  const estimatedGas = await NFTContract.methods
    .mintWithTokenURI(window.klaytn.selectedAddress, tokenID, genralTokenURI, masterTokenURI, menuType)
    .estimateGas({
      from: window.klaytn.selectedAddress,
    });

  caver.klay
    .sendTransaction({
      type: 'SMART_CONTRACT_EXECUTION',
      from: window.klaytn.selectedAddress,
      to: process.env.REACT_APP_NFT_CONTRACT_ADDRESS,
      data: contract.methods
        .mintWithTokenURI(window.klaytn.selectedAddress, tokenID, genralTokenURI, masterTokenURI, menuType)
        .encodeABI(),
      value: '0x00',
      gas: estimatedGas,
    })
    .on('transactionHash', (hash) => {
      console.log(`transactionHash ${hash}`);
    })
    .on('receipt', (receipt) => {
      // success
      console.log(`succes`, receipt);
    })
    .on('error', (e) => {
      // failed
      console.log(`error ${e}`);
    });
};

export const mintWithKlay = async (tokenID, genralTokenURI, masterTokenURI, menuType) => {
  const contract = caver.contract.create([JSON.parse(mintWithklayABI)], process.env.REACT_APP_NFT_CONTRACT_ADDRESS);
  const estimatedGas = await NFTContract.methods
    .mintWithKlay(window.klaytn.selectedAddress, tokenID, genralTokenURI, masterTokenURI, menuType)
    .estimateGas({
      from: window.klaytn.selectedAddress,
    });

  caver.klay
    .sendTransaction({
      type: 'SMART_CONTRACT_EXECUTION',
      from: window.klaytn.selectedAddress,
      to: process.env.REACT_APP_NFT_CONTRACT_ADDRESS,
      data: contract.methods
        .mintWithKlay(window.klaytn.selectedAddress, tokenID, genralTokenURI, masterTokenURI, menuType)
        .encodeABI(),
      value: '500000000000000000',
      gas: estimatedGas,
    })
    .on('transactionHash', (hash) => {
      console.log(`transactionHash ${hash}`);
    })
    .on('receipt', (receipt) => {
      // success
      console.log(`succes`, receipt);
    })
    .on('error', (e) => {
      // failed
      console.log(`error ${e}`);
    });
};

export const proposeMenu = async (name, nftAddress) => {
  const contract = caver.contract.create([JSON.parse(proposeMenuABI)], process.env.REACT_APP_VOTE_CONTRACT_ADDRESS);
  const estimatedGas = await NFTContract.methods.proposeMenu(name, nftAddress).estimateGas({
    from: window.klaytn.selectedAddress,
  });

  caver.klay
    .sendTransaction({
      type: 'SMART_CONTRACT_EXECUTION',
      from: window.klaytn.selectedAddress,
      to: process.env.REACT_APP_VOTE_CONTRACT_ADDRESS,
      data: contract.methods.proposeMenu(name, nftAddress).encodeABI(),
      value: '0x00',
      gas: estimatedGas,
    })
    .on('transactionHash', (hash) => {
      console.log(`transactionHash ${hash}`);
    })
    .on('receipt', (receipt) => {
      // success
      console.log(`succes`, receipt);
    })
    .on('error', (e) => {
      // failed
      console.log(`error ${e}`);
    });
};

export const vote = async (proposal, nftAddress) => {
  const contract = caver.contract.create([JSON.parse(voteABI)], process.env.REACT_APP_VOTE_CONTRACT_ADDRESS);
  const estimatedGas = await NFTContract.methods.vote(proposal, nftAddress).estimateGas({
    from: window.klaytn.selectedAddress,
  });

  caver.klay
    .sendTransaction({
      type: 'SMART_CONTRACT_EXECUTION',
      from: window.klaytn.selectedAddress,
      to: process.env.REACT_APP_VOTE_CONTRACT_ADDRESS,
      data: contract.methods.vote(proposal, nftAddress).encodeABI(),
      value: '0x00',
      gas: estimatedGas,
    })
    .on('transactionHash', (hash) => {
      console.log(`transactionHash ${hash}`);
    })
    .on('receipt', (receipt) => {
      // success
      console.log(`succes`, receipt);
    })
    .on('error', (e) => {
      // failed
      console.log(`error ${e}`);
    });
};
