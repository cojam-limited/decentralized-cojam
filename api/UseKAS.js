import axios from "axios";

const nftcontract = process.env.REACT_APP_NFT_CONTRACT_ADDRESS;
const option = {
    headers: {
        Authorization: "Basic " + Buffer.from(process.env.REACT_APP_ACCESS_KEY_ID + ":" + process.env.REACT_APP_SECRET_ACCESS_KEY).toString("base64"),
        "x-chain-id" : process.env.REACT_APP_CHAIN_ID,
        "content-type" : "application/json"

    }
}

export const ownNftList = async (ownaddress) =>{
    try{
        const reponse = await axios.get(`https://th-api.klaytnapi.com/v2/contract/nft/${nftcontract}/owner/${ownaddress}`, option);
        // const jsonReponse = JSON.stringify(reponse);
        const data = reponse.data.items;
        console.log(data);
        // let temp = new Array(data.length);
        let nfts = [];
        for(let i = 0; i < data.length; i++) {
            console.log(parseInt(data[i].tokenId,16) );
            nfts.push({tokenId: parseInt(data[i].tokenId,16), uri: data[i].tokenUri})
        }
        console.log(nfts);
        //console.log(reponse.data);
        masterNftList();
        return nfts;
    }catch(e){
        console.log(e);
        return false;
    }
}

export const masterNftList = async () =>{
    try{
        const reponse = await axios.get(`https://th-api.klaytnapi.com/v2/contract/nft/${nftcontract}/token`, option);
        // const jsonReponse = JSON.stringify(reponse);
        const data = reponse.data.items;
        console.log(data);
        // let temp = new Array(data.length);
        let nfts = [];
        for(let i = 0; i < data.length; i++) {
            console.log(parseInt(data[i].tokenId,16) );
            nfts.push({tokenId: parseInt(data[i].tokenId,16), uri: data[i].tokenUri})
        }
        console.log(nfts);
        //console.log(reponse.data);
        return nfts;
    }catch(e){
        console.log(e);
        return false;
    }
}
