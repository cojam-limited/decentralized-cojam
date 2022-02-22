import Caver from 'caver-js';
import NFTABI from '@abi/NFT.json';
import axios from 'axios';

//KAS API 호출 시 필요한 헤더
const option = {
  headers: [
    {
      name: 'Authorization',
      value:
        'Basic ' +
        Buffer.from(process.env.REACT_APP_ACCESS_KEY_ID + ':' + process.env.REACT_APP_SECRET_ACCESS_KEY).toString(
          'base64',
        ),
    },
    { name: 'x-chain-id', value: process.env.REACT_APP_CHAIN_ID },
  ],
};

//KAS API 사용을 위한 객체 생성
const caver = new Caver(new Caver.providers.HttpProvider('https://node-api.klaytnapi.com/v1/klaytn', option));

//참조 ABI와 스마트컨트랙트 주소를 통해 스마트컨트랙트 연동
const NFTContract = new caver.contract(NFTABI, process.env.REACT_APP_NFT_CONTRACT_ADDRESS);

//owner account 설정
const deployer = caver.wallet.keyring.createFromPrivateKey(process.env.REACT_APP_DEPLOYER_PRIVATE_KEY);
caver.wallet.add(deployer);

//유저에게 임시로 minter 권한 부여
export const addMinter = async (account) => {
  try {
    //예상 가스
    const estimatedGas = await caver.rpc.klay.estimateGas(NFTContract.methods.addBadgemealMinter(account));

    //addBadgemealMinter 실행
    const receipt = await NFTContract.methods.addBadgemealMinter(account).send({
      from: deployer.address, // owner 주소
      gas: String(estimatedGas), // 수수료
    });
    console.log(receipt);
  } catch (e) {
    console.log(`[ERROR_addBadgemealMinter]${e}`);
  }
};

//유저의 minter 권한 삭제
export const removeMinter = async (account) => {
  try {
    //예상 가스
    const estimatedGas = await caver.rpc.klay.estimateGas(NFTContract.methods.removeBadgemealMinter(account));

    //removeBadgemealMinter 실행
    const receipt = await NFTContract.methods.removeBadgemealMinter(account).send({
      from: deployer.address, // owner 주소
      gas: String(estimatedGas), // 수수료
    });
    console.log('receipt', receipt);
  } catch (e) {
    console.log(`[ERROR_removeBadgemealMinter]${e}`);
  }
};
