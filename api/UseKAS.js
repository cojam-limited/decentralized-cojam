import axios from 'axios';
import Caver from 'caver-js';
const option = {
  headers: {
    Authorization:
      'Basic ' +
      Buffer.from(process.env.REACT_APP_ACCESS_KEY_ID + ':' + process.env.REACT_APP_SECRET_ACCESS_KEY).toString(
        'base64',
      ),
    'x-chain-id': process.env.REACT_APP_CHAIN_ID,
    'content-type': 'application/json',
  },
};

const caver = new Caver(window.klaytn);

export const ownNftList = async (ownaddress) => {
  try {
    const response = await axios.get(
      `https://th-api.klaytnapi.com/v2/contract/nft/${process.env.REACT_APP_NFT_CONTRACT_ADDRESS}/owner/${ownaddress}`,
      option,
    );
    /* ✨response.data.items
        [{createdAt: 1645595613
        owner: "0x9bf610e09d53f1a884becaa43f94a04948285600"
        previousOwner: "0x0000000000000000000000000000000000000000"
        tokenId: "0x1e"
        tokenUri: "qwer"
        transactionHash: "0x9df54c25aa4869f7aa4c708d4d361bd5de5d2707aff03866929e1b546e9b8f36"
        updatedAt: 1645595613}]
    */
    const data = response.data.items;
    let nfts = [];
    for (let i = 0; i < data.length; i++) {
      const response = await axios.get(data[i].tokenUri); // JSON 형식 메타데이터가 들어옴
      const uriJSON = response.data;
      /** ✨uriJSON 샘플
       {
        "name": "Puppy Heaven NFT",
        "description": "This is a sample description",
        "imageUrl": "https://metadata-store.klaytnapi.com/e2d83vdb-c108-823c-d5f3-69vdf2d871c51/4a85e6be-3215-93e6-d8a9-3a7d633584e7.png"
        }
       */

      //🔥uriJSON 타입이 결정되면 푸쉬 데이터 변경
      nfts.push({ tokenId: data[i].tokenId, imageUri: uriJSON.imageUri, menuType: uriJSON.name });
    }
    console.log(nfts);
    return nfts;
  } catch (e) {
    console.log(e);
    return false;
  }
};
