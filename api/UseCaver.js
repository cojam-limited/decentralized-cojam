import Caver from 'caver-js';
import NFTABI from '@abi/NFT.json';

//KAS API 호출 시 필요한 헤더
const option = {
  headers: [
    {
      name: 'Authorization',
      value:
        'Basic ' +
        Buffer.from(
          process.env.REACT_APP_KAS_ACCESS_KEY_ID + ':' + process.env.REACT_APP_KAS_SECRET_ACCESS_KEY,
        ).toString('base64'),
    },
    { name: 'x-chain-id', value: process.env.REACT_APP_CHAIN_ID },
  ],
};

//KAS API 사용을 위한 객체 생성
const caver = new Caver(new Caver.providers.HttpProvider('https://node-api.klaytnapi.com/v1/klaytn', option));

//참조 ABI와 스마트컨트랙트 주소를 통해 스마트컨트랙트 연동
const NFTContract = new caver.contract(NFTABI, process.env.REACT_APP_NFT_CONTRACT_ADDRESS);

//유저에게 임시로 minter 권한 부여
export const addUserMinter = async () => {
  try {
    //owner account 설정
    const deployer = caver.wallet.keyring.createFromPrivateKey(process.env.REACT_APP_DEPLOYER_PRIVATE_KEY);
    caver.wallet.add(deployer);

    const estimatedGas = await caver.klay.estimateGas(NFTContract.methods.addMinter(window.klaytn.selectedAddress));

    //addMinter 실행
    const receipt = await NFTContract.methods.addMinter(window.klaytn.selectedAddress).send({
      from: deployer.address, // owner 주소
      gas: String(estimatedGas), // 수수료
    });
    console.log(receipt);
  } catch (e) {
    console.log(`[ERROR_addminter]${e}`);
  }
};
