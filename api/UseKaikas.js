import Caver from 'caver-js';
import toastNotify from '@utils/toast';
import { mintWithTokenURIABI, mintWithklayABI, proposeMenuABI, voteABI } from '@config/index';
import NFTABI from '@abi/NFT.json';
import VOTEABI from '@abi/Vote.json';

const caver = new Caver(window.klaytn);
const NFT_ADDRESS = process.env.REACT_APP_NFT_CONTRACT_ADDRESS;
const VOTE_ADDRESS = process.env.REACT_APP_VOTE_CONTRACT_ADDRESS;
const NFTContract = new caver.contract(NFTABI, NFT_ADDRESS);
const VoteContract = new caver.contract(VOTEABI, VOTE_ADDRESS);

export const kaikasLogin = async () => {
  try {
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
  } catch (error) {
    console.error('kaikasLogin', error);
  }
};

export const kaikasGetBalance = async (address) => {
  try {
    const balance = await caver.rpc.klay.getBalance(address);
    console.log(`현재 잔액 : ${balance / 10 ** 18}`);
    return balance;
  } catch (error) {
    console.error('kaikasGetBalance', error);
  }
};

export const isKaikasUnlocked = async () => {
  try {
    const result = await window.klaytn._kaikas.isUnlocked();
    return result; //잠금상태: false, 열린상태: true
  } catch (error) {
    console.error('isKaikasUnlocked', error);
  }
};

export const isKaikasEnabled = async () => {
  try {
    const result = await window.klaytn._kaikas.isEnabled();
    return result;
  } catch (error) {
    console.error('isKaikasEnabled', error);
  }
};

export const mintWithTokenURI = async (tokenID, genralTokenURI, masterTokenURI, menuType) => {
  try {
    const estimatedGas = await NFTContract.methods
      .mintWithTokenURI(window.klaytn.selectedAddress, tokenID, genralTokenURI, masterTokenURI, menuType)
      .estimateGas({
        from: window.klaytn.selectedAddress,
      });

    const encodedData = NFTContract.methods
      .mintWithTokenURI(window.klaytn.selectedAddress, tokenID, genralTokenURI, masterTokenURI, menuType)
      .encodeABI();

    caver.klay
      .sendTransaction({
        type: 'SMART_CONTRACT_EXECUTION',
        from: window.klaytn.selectedAddress,
        to: process.env.REACT_APP_NFT_CONTRACT_ADDRESS,
        data: encodedData,
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
  } catch (error) {
    console.error('mintWithTokenURI', error);
  }
};

export const mintWithKlay = async (tokenID, genralTokenURI, masterTokenURI, menuType) => {
  try {
    const estimatedGas = await NFTContract.methods
      .mintWithKlay(window.klaytn.selectedAddress, tokenID, genralTokenURI, masterTokenURI, menuType)
      .estimateGas({
        from: window.klaytn.selectedAddress,
      });
    const encodedData = NFTContract.methods
      .mintWithKlay(window.klaytn.selectedAddress, tokenID, genralTokenURI, masterTokenURI, menuType)
      .encodeABI();

    caver.klay
      .sendTransaction({
        type: 'SMART_CONTRACT_EXECUTION',
        from: window.klaytn.selectedAddress,
        to: process.env.REACT_APP_NFT_CONTRACT_ADDRESS,
        data: encodedData,
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
  } catch (error) {
    console.error('mintWithKlay', error);
  }
};

export const proposeMenu = async (name) => {
  try {
    const estimatedGas = await VoteContract.methods.proposeMenu(name, NFT_ADDRESS).estimateGas({
      from: window.klaytn.selectedAddress,
    });

    const encodedData = VoteContract.methods.proposeMenu(name, NFT_ADDRESS).encodeABI();

    caver.klay
      .sendTransaction({
        type: 'SMART_CONTRACT_EXECUTION',
        from: window.klaytn.selectedAddress,
        to: process.env.REACT_APP_VOTE_CONTRACT_ADDRESS,
        data: encodedData,
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
  } catch (error) {
    console.error('proposeMenu', error);
  }
};

export const vote = async (proposal) => {
  try {
    const estimatedGas = await VoteContract.methods.vote(proposal, NFT_ADDRESS).estimateGas({
      from: window.klaytn.selectedAddress,
    });
    const encodedData = VoteContract.methods.vote(proposal, NFT_ADDRESS).encodeABI();

    caver.klay
      .sendTransaction({
        type: 'SMART_CONTRACT_EXECUTION',
        from: window.klaytn.selectedAddress,
        to: process.env.REACT_APP_VOTE_CONTRACT_ADDRESS,
        data: encodedData,
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
  } catch (error) {
    console.error('vote', error);
  }
};

// NFT 소유자인지 검증: true,false
export const isBadgemealNFTholder = async () => {
  try {
    //예상 가스
    const estimatedGas = await VoteContract.methods.isNFTholder(NFT_ADDRESS).estimateGas({
      from: window.klaytn.selectedAddress,
    });

    const receipt = await VoteContract.methods.isNFTholder(NFT_ADDRESS).call({
      from: window.klaytn.selectedAddress,
      gas: estimatedGas,
    });

    return receipt;
  } catch (error) {
    console.log('isBadgemealNFTholder', error);
  }
};

// Master NFT 소유자인지 검증: true,false
export const isBadgemealMasterNFTholder = async () => {
  try {
    //예상 가스
    const estimatedGas = await VoteContract.methods.isMasterNFTholder(NFT_ADDRESS).estimateGas({
      from: window.klaytn.selectedAddress,
    });

    const receipt = await VoteContract.methods.isMasterNFTholder(NFT_ADDRESS).call({
      from: window.klaytn.selectedAddress,
      gas: estimatedGas,
    });

    return receipt;
  } catch (error) {
    console.log('isBadgemealMasterNFTholder', error);
  }
};

export const getProposalListLength = async () => {
  try {
    const receipt = await VoteContract.methods.getProposedMenuListLength().call({
      from: window.klaytn.selectedAddress,
    });

    return receipt;
  } catch (error) {
    console.log('getProposalListLength', error);
  }
};

export const getProposalList = async () => {
  try {
    const list = [];
    const length = await getProposalListLength();
    for (let i = 0; i < length; i++) {
      const id = await VoteContract.methods.proposals(i).call({
        from: window.klaytn.selectedAddress,
      });
      list.push(id);
    }
    return list;
  } catch (error) {
    console.log('getProposalList', error);
  }
};

export const getWinnerProposalListLength = async () => {
  try {
    const receipt = await VoteContract.methods.getwinnerProposalsLength().call({
      from: window.klaytn.selectedAddress,
    });

    return receipt;
  } catch (error) {
    console.log('getWinnerProposalListLength', error);
  }
};

export const getWinnerProposalList = async () => {
  try {
    const list = [];
    const length = await getWinnerProposalListLength();
    for (let i = 0; i < length; i++) {
      const id = await VoteContract.methods.winnerProposals(i).call({
        from: window.klaytn.selectedAddress,
      });
      list.push(id);
    }
    return list;
  } catch (error) {
    console.log('getWinnerProposalList', error);
  }
};
