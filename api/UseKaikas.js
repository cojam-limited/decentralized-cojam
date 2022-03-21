import Caver from 'caver-js';
import toastNotify from '@utils/toast';
import NFTABI from '@abi/NFT.json';
import VOTEABI from '@abi/Vote.json';
import { initDrawResult } from '@api/draw';
import { updateMintCount } from '@api/nft';
import { initMintData } from '@api/mintData';
//import { removeMinter } from '@api/UseCaverForOwner';

const caver = new Caver(window.klaytn);
const NFT_ADDRESS = process.env.REACT_APP_NFT_CONTRACT_ADDRESS;
const VOTE_ADDRESS = process.env.REACT_APP_VOTE_CONTRACT_ADDRESS;
const NFTContract = new caver.contract(NFTABI, NFT_ADDRESS);
const VoteContract = new caver.contract(VOTEABI, VOTE_ADDRESS);

export const kaikasLogin = async () => {
  try {
    if (typeof window.klaytn !== 'undefined') {
      const accounts = await window.klaytn.enable();

      console.log('account ?? ', accounts);
      const account = accounts[0]; // We currently only ever provide a single account,
      console.log(`지갑주소 : ${account}`);
      console.log(window.klaytn);
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
    const result = await window.klaytn?._kaikas.isUnlocked();
    return result; //잠금상태: false, 열린상태: true
  } catch (error) {
    console.error('isKaikasUnlocked', error);
  }
};

export const isKaikasEnabled = async () => {
  try {
    const result = await window.klaytn?._kaikas.isEnabled();
    return result;
  } catch (error) {
    console.error('isKaikasEnabled', error);
  }
};

export const mintWithTokenURI = async ({
  tokenID,
  genralTokenURI,
  masterTokenURI,
  menuType,
  walletData,
  mintCountData,
  cid,
}) => {
  try {
    console.log(tokenID, genralTokenURI, masterTokenURI, menuType);

    const estimatedGas = await NFTContract.methods
      .mintWithTokenURI(window.klaytn.selectedAddress, tokenID, genralTokenURI, masterTokenURI, menuType)
      .estimateGas({
        from: window.klaytn.selectedAddress,
      });

    console.log('estimatedGas', estimatedGas);

    const encodedData = NFTContract.methods
      .mintWithTokenURI(window.klaytn.selectedAddress, tokenID, genralTokenURI, masterTokenURI, menuType)
      .encodeABI();

    await caver.klay
      .sendTransaction({
        type: 'SMART_CONTRACT_EXECUTION',
        from: window.klaytn.selectedAddress,
        to: process.env.REACT_APP_NFT_CONTRACT_ADDRESS,
        data: encodedData,
        value: '0x00',
        gas: estimatedGas + 100000, //🔥estimatedGas보다 실제 gas가 더 많이 드는 이슈 발생해서 우선 더 높은 값을 주는 것으로 세팅
      })
      .on('transactionHash', (hash) => {
        console.log(`transactionHash ${hash}`);
      })
      .on('receipt', (receipt) => {
        // success
        toastNotify({
          state: 'success',
          message: 'Got BadgeMeal NFT!',
        });
        //발행이 완료되면 유저의 mint 권한을 제거한다.
        //removeMinter(walletData?.account);
        //발행이 완료되면 mintData 초기화
        initMintData(walletData?.account);
        //발행이 완료되면 drawResult 초기화
        initDrawResult(walletData?.account);

        //발행이 완료되면 mintCountData++
        updateMintCount(walletData?.account, mintCountData);

        const decodedMintMasterNFTeventLog = caver.klay.abi.decodeLog(
          [
            {
              indexed: false,
              name: 'typeString',
              type: 'string',
            },
          ],
          receipt.logs[1].data,
          receipt.logs[1].topics.slice(1),
        );
        console.log('mint event type: ', decodedMintMasterNFTeventLog?.typeString);

        if (decodedMintMasterNFTeventLog?.typeString === 'MintMasterNFT') {
          //마스터 NFT 발행이 완료되면 마스터 NFT DB업데이트
          updateMintedMasterNft(cid);
        }
        console.log(`mintWithTokenURI success`, receipt);
      })
      .on('error', (e) => {
        // failed
        toastNotify({
          state: 'error',
          message: 'An Error is occurred.',
        });
        console.error('mintWithTokenURI error', e);
      });
  } catch (error) {
    console.error('mintWithTokenURI', error);
  }
};

export const mintWithKlay = async ({
  tokenID,
  genralTokenURI,
  masterTokenURI,
  menuType,
  walletData,
  mintCountData,
}) => {
  try {
    console.log(tokenID, genralTokenURI, masterTokenURI, menuType);
    const estimatedGas = await NFTContract.methods
      .mintWithKlay(window.klaytn.selectedAddress, tokenID, genralTokenURI, masterTokenURI, menuType)
      .estimateGas({
        from: window.klaytn.selectedAddress,
      });
    const encodedData = NFTContract.methods
      .mintWithKlay(window.klaytn.selectedAddress, tokenID, genralTokenURI, masterTokenURI, menuType)
      .encodeABI();

    await caver.klay
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
        toastNotify({
          state: 'success',
          message: 'Got BadgeMeal NFT!',
        });

        //발행이 완료되면 유저의 mint 권한을 제거한다.
        //removeMinter(walletData?.account);

        //발행이 완료되면 mintData 초기화
        initMintData(walletData?.account);

        //발행이 완료되면 drawResult 초기화
        initDrawResult(walletData?.account);

        //발행이 완료되면 mintCountData++
        updateMintCount(walletData?.account, mintCountData);

        console.log(`success`, receipt);
      })
      .on('error', (e) => {
        // failed
        toastNotify({
          state: 'error',
          message: 'An Error is occurred.',
        });
        console.log('mintWithKlay error', e);
      });
  } catch (error) {
    //await removeMinter(walletData?.account);
    console.error('mintWithKlay', error);
  }
};

export const proposeMenu = async (name) => {
  try {
    const estimatedGas = await VoteContract.methods.proposeMenu(name, NFT_ADDRESS).estimateGas({
      from: window.klaytn.selectedAddress,
    });

    const encodedData = VoteContract.methods.proposeMenu(name, NFT_ADDRESS).encodeABI();

    await caver.klay
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
        toastNotify({
          state: 'success',
          message: 'Uploaded!',
        });
        console.log(`success`, receipt);
      })
      .on('error', (e) => {
        // failed
        toastNotify({
          state: 'error',
          message: 'An Error is occurred.',
        });
        console.log('proposeMenu error', e);
      });
  } catch (error) {
    console.error('proposeMenu', error);
  }
};

export const vote = async (proposal) => {
  try {
    const encodedData = VoteContract.methods.vote(proposal, NFT_ADDRESS).encodeABI();
    const estimatedGas = await VoteContract.methods.vote(proposal, NFT_ADDRESS).estimateGas();
    await caver.klay
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
        toastNotify({
          state: 'success',
          message: 'Voted!',
        });
        console.log(`success`, receipt);
      })
      .on('error', (e) => {
        // failed
        toastNotify({
          state: 'error',
          message: 'An Error is occurred.',
        });
        console.log('vote error', e);
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
