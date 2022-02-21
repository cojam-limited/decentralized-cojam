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
        const reponse = await axios.get(`https://kip17-api.klaytnapi.com/v1/contract/${nftcontract}/owner/${ownaddress}`, option);
        console.log(JSON.stringify(reponse));
        // return reponse.data.uri;
    }catch(e){
        console.log(e);
        return false;
    }


}