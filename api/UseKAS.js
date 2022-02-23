import axios from "axios";
import Caver from "caver-js";
import NFTABI from "../abi/NFT.json";
const option = {
    headers: {
        Authorization: "Basic " + Buffer.from(process.env.REACT_APP_ACCESS_KEY_ID + ":" + process.env.REACT_APP_SECRET_ACCESS_KEY).toString("base64"),
        "x-chain-id" : process.env.REACT_APP_CHAIN_ID,
        "content-type" : "application/json"
        
    }
}

const caver = new Caver(window.klaytn);
const NFTContract = new caver.contract(NFTABI, process.env.REACT_APP_NFT_CONTRACT_ADDRESS);


export const ownNftList = async (ownaddress) =>{
    try{
        const reponse = await axios.get(`https://th-api.klaytnapi.com/v2/contract/nft/${process.env.REACT_APP_NFT_CONTRACT_ADDRESS}/owner/${ownaddress}`, option);
        // const jsonReponse = JSON.stringify(reponse);
        const data = reponse.data.items;
        let nfts = [];
        for(let i = 0; i < data.length; i++) {
            const _tokenId = parseInt(data[i].tokenId,16);
            const _menuType = await NFTContract.methods.menuType(_tokenId).call();

            console.log(_menuType);
            nfts.push({tokenId: _tokenId, uri: data[i].tokenUri, menuType: _menuType})
        }
        console.log(nfts);
        //console.log(reponse.data);
        return nfts;
    }catch(e){
        console.log(e);
        return false;
    }
}

export const masterNftList = async () =>{
    try{
        const reponse = await axios.get(`https://th-api.klaytnapi.com/v2/contract/nft/${process.env.REACT_APP_NFT_CONTRACT_ADDRESS}/token`, option);
        // const jsonReponse = JSON.stringify(reponse);
        const data = reponse.data.items;
        // let temp = new Array(data.length);
        let nfts = [];
        for(let i = 0; i < data.length; i++) {
            const _tokenId = parseInt(data[i].tokenId,16);
            const _nftType = await NFTContract.methods.nftType(_tokenId).call();
            if(nftType != 2){
                continue;
            }
            const _menuType = await NFTContract.methods.menuType(_tokenId).call();
            nfts.push({tokenId: _tokenId, uri: data[i].tokenUri, menuType: _menuType});
        }
        console.log(`materNFT, ${nfts}`);
        //console.log(reponse.data);
        return nfts;
    }catch(e){
        console.log(e);
        return false;
    }
}
