import { BADGEMEAL_CONTRACT_ADDRESS } from '../config/index.js'
import Caver from 'caver-js' // or const Caver = require('caver-js')


const caver = new Caver(window.klaytn);

const mintWithTokenURIABI = '[{ "constant": false, "inputs": [ { "name": "to", "type": "address" }, { "name": "tokenId", "type": "uint256" }, { "name": "genralTokenURI", "type": "string" }, { "name": "masterTokenURI", "type": "string" }, { "name": "menuType", "type": "string" } ], "name": "mintWithTokenURI", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }]';
const mintWithTokenURIContract = new caver.klay.Contract(JSON.parse(mintWithTokenURIABI), BADGEMEAL_CONTRACT_ADDRESS);

//mintWithklay
const mintWithklayABI = '[{ "constant": false, "inputs": [ { "name": "to", "type": "address" }, { "name": "tokenId", "type": "uint256" }, { "name": "genralTokenURI", "type": "string" }, { "name": "masterTokenURI", "type": "string" }, { "name": "menuType", "type": "string" } ], "name": "mintWithKlay", "outputs": [ { "name": "", "type": "bool" } ], "payable": true, "stateMutability": "payable", "type": "function" }]';
const mintWithKlayContract = new caver.klay.Contract(JSON.parse(mintWithklayABI), BADGEMEAL_CONTRACT_ADDRESS);


export const kaikasLogin = async () => {
    // if(klaytn.isKaikas)
    if (typeof window.klaytn !== 'undefined') {
        const accounts = await window.klaytn.enable()
        const account = accounts[0] // We currently only ever provide a single account,
        console.log(`지갑주소 : ${account}`);
        console.log(`네트워크 주소 : ${window.klaytn.networkVersion}`);
        kaikasGetBalance(account);
        return;
        // but the array gives us some room to grow.
    }
}

const kaikasGetBalance = async (address) => {
    const balance = await caver.klay.getBalance(address);
    console.log(`현재 잔액 : ${balance / (10 ** 18)}`);
}

export const mintWithTokenURI = async (tokenID, genralTokenURI, masterTokenURI, menuType) => {
    const receipt = await mintWithTokenURIContract.methods.mintWithTokenURI(
        window.klaytn.selectedAddress,
        tokenID,
        genralTokenURI,
        masterTokenURI,
        menuType
    ).send({
        from: window.klaytn.selectedAddress,
        gas: '8000000',
        value: caver.utils.toPeb(0, 'KLAY')
    },

        function (error, transactionHash) {
            if (error != null) {
                console.log(`error ${error}`);
            }
            console.log(`reuslt ${transactionHash}`);
        });
}



export const mintWithKlay = async (tokenID, genralTokenURI, masterTokenURI, menuType) => {
    const receipt = await mintWithKlayContract.methods.mintWithKlay(
        window.klaytn.selectedAddress,
        tokenID,
        genralTokenURI,
        masterTokenURI,
        menuType
    ).send({
        from: window.klaytn.selectedAddress,
        gas: '8000000',
        value: caver.utils.toPeb(1, 'KLAY')
    },

        function (error, transactionHash) {
            if (error != null) {
                console.log(`error ${error}`);
            }
            console.log(`reuslt ${transactionHash}`);
        });
}

