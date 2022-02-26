export const isDevelopment = process.env.NODE_ENV !== 'production';

//Constants
export const DEFAULT_QR_CODE = 'DEFAULT';
export const DEFAULT_ADDRESS = '0x00000000000000000000000000000';
export const APP_NAME = 'BadgeMeal';

//URL
// export const API_BASE_URL = 'http://tostit.i234.me:5005/api/';
export const API_BASE_URL = '/api/';
export const A2P_API_PREPARE_URL = 'https://a2a-api.klipwallet.com/v2/a2a/prepare';

//kip17 abi
export const mintWithTokenURIABI =
  '{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"},{"name":"genralTokenURI","type":"string"},{"name":"masterTokenURI","type":"string"},{"name":"menuType","type":"string"}],"name":"mintWithTokenURI","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}';
export const mintWithklayABI =
  '{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"},{"name":"genralTokenURI","type":"string"},{"name":"masterTokenURI","type":"string"},{"name":"menuType","type":"string"}],"name":"mintWithKlay","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"}';
//vote abi
export const proposeMenuABI =
  '{ "constant": false, "inputs": [ { "name": "_name", "type": "string" }, { "name": "_nftAddress", "type": "address" } ], "name": "proposeMenu", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }';
export const voteABI =
  '{ "constant": false, "inputs": [ { "name": "_proposal", "type": "uint256" }, { "name": "_nftAddress", "type": "address" } ], "name": "vote", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }';
