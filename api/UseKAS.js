import axios from 'axios';

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
          "name": "Magic Sword",
          "description" : "게임 내에서 마법 속성을 띈 마검을 소환할 수 있습니다.",
          "image": "https://path_to_image/image.png"
        } 
       */

      nfts.push({ imageUri: uriJSON.image, menuType: uriJSON.name });
    }
    return nfts;
  } catch (error) {
    console.log(error);
  }
};

//발행된 NFT 정보를 100개까지만 불러오는 함수
export const getNFTList = async () => {
  try {
    const response = await axios.get(
      `https://th-api.klaytnapi.com/v2/contract/nft/${process.env.REACT_APP_NFT_CONTRACT_ADDRESS}/token`,
      option,
    );

    /**
     * [{
      "tokenId": "0x9",
      "owner": "0x36884a060be5438226c4deaf799b0f7de5abd5df",
      "previousOwner": "0x0000000000000000000000000000000000000000",
      "tokenUri": "http://ec2-13-125-244-0.ap-northeast-2.compute.amazonaws.com:8080/meta/item9",
      "transactionHash": "0x2f6e8113862c1dbdc76a2fb29cda2dbefeca5878897af0bb3df6822323e89440",
      "createdAt": 1597718863,
      "updatedAt": 1597718863
      }],
     */

    const data = response.data.items;
    let nfts = [];
    for (let i = 0; i < data.length; i++) {
      const response = await axios.get(data[i].tokenUri); // JSON 형식 메타데이터가 들어옴
      const uriJSON = response.data;
      /** ✨uriJSON 샘플
       {
          "name": "Magic Sword",
          "description" : "게임 내에서 마법 속성을 띈 마검을 소환할 수 있습니다.",
          "image": "https://path_to_image/image.png"
        } 
       */

      nfts.push({ imageUri: uriJSON.image, menuType: uriJSON.name });
    }
    return nfts;
  } catch (error) {
    console.log(error);
  }
};
