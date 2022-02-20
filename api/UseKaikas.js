import Caver from 'caver-js' // or const Caver = require('caver-js')


const caver = new Caver(window.klaytn);

const BADGEMEAL_CONTRACT_ADDRESS = process.env.REACT_APP_NFT_CONTRACT_ADDRESS;

const mintWithTokenURIABI = '[{ "constant": false, "inputs": [ { "name": "to", "type": "address" }, { "name": "tokenId", "type": "uint256" }, { "name": "genralTokenURI", "type": "string" }, { "name": "masterTokenURI", "type": "string" }, { "name": "menuType", "type": "string" } ], "name": "mintWithTokenURI", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }]';
const mintWithklayABI = '[{ "constant": false, "inputs": [ { "name": "to", "type": "address" }, { "name": "tokenId", "type": "uint256" }, { "name": "genralTokenURI", "type": "string" }, { "name": "masterTokenURI", "type": "string" }, { "name": "menuType", "type": "string" } ], "name": "mintWithKlay", "outputs": [ { "name": "", "type": "bool" } ], "payable": true, "stateMutability": "payable", "type": "function" }]';

const setAddress = (address) =>{
    window.sessionStorage.setItem("userAddress", address);
}
const setBalance = (balance) =>{
    window.sessionStorage.setItem("userBalance", balance);
}
export const kaikasLogin = async () => {
    // if(klaytn.isKaikas)
    if (typeof window.klaytn !== 'undefined') {
        const accounts = await window.klaytn.enable()
        const account = accounts[0] // We currently only ever provide a single account,
        console.log(`지갑주소 : ${account}`);
        console.log(`네트워크 주소 : ${window.klaytn.networkVersion}`);
        setAddress(account);
        kaikasGetBalance(account);
        return;
        // but the array gives us some room to grow.
    }
}

const kaikasGetBalance = async (address) => {
    const balance = await caver.klay.getBalance(address);
    setBalance(balance);
    console.log(`현재 잔액 : ${balance / (10 ** 18)}`);
}

export const mintWithTokenURI = async (tokenID, genralTokenURI, masterTokenURI, menuType) => {
    
    const contract = caver.contract.create(JSON.parse(mintWithTokenURIABI),process.env.REACT_APP_NFT_CONTRACT_ADDRESS);
    
    caver.klay.sendTransaction({
        type: 'SMART_CONTRACT_EXECUTION',
        from: window.klaytn.selectedAddress,
        to: process.env.REACT_APP_NFT_CONTRACT_ADDRESS,
        data: contract.methods.mintWithTokenURI(
            window.klaytn.selectedAddress,
            tokenID,
            genralTokenURI,
            masterTokenURI,
            menuType
        ).encodeABI(),
        value: caver.utils.toPeb(0, 'KLAY'),
        gas: '8000000'
    })
    .on('transactionHash', (hash) => {
        console.log(`transactionHash ${hash}`);
    })
    .on('receipt', (receipt) => {
        // success
        console.log(`succes ${receipt}`);
    })
    .on('error', (e) => {
      // failed
      console.log(`error ${e}`);
    });

}

export const mintWithKlay = async (tokenID, genralTokenURI, masterTokenURI, menuType) => {
    
    const contract = caver.contract.create(JSON.parse(mintWithklayABI),process.env.REACT_APP_NFT_CONTRACT_ADDRESS);
    
    caver.klay.sendTransaction({
        type: 'SMART_CONTRACT_EXECUTION',
        from: window.klaytn.selectedAddress,
        to: process.env.REACT_APP_NFT_CONTRACT_ADDRESS,
        data: contract.methods.mintWithKlay(
            window.klaytn.selectedAddress,
            tokenID,
            genralTokenURI,
            masterTokenURI,
            menuType
        ).encodeABI(),
        value: '500000000000000000',
        gas: '8000000'
    })
    .on('transactionHash', (hash) => {
        console.log(`transactionHash ${hash}`);
    })
    .on('receipt', (receipt) => {
        // success
        console.log(`succes ${receipt}`);
    })
    .on('error', (e) => {
      // failed
      console.log(`error ${e}`);
    });
    
}

