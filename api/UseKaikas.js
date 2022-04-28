import Caver from 'caver-js';
import CaverExtKAS from 'caver-js-ext-kas';
import toastNotify from '@utils/toast';

import axios from 'axios';

const caver = new Caver(window.klaytn);
const caverExt = new CaverExtKAS('1001', 'KASKABM99U30BTVDXCYDMQQF', 'P6vSKCjKxYuXdpp7e1H7JJjQNVvjwr46FYdcZhdm');

//const cojamTokenAddress = '0x7f223b1607171b81ebd68d22f1ca79157fd4a44b';   // contract address - prod

//const cojamTokenAddress = '0xbb1cafc1444fbd3df6d233e232463154eb17db38';   // my cojam token address - dev
const cojamTokenAddress = '0xd6cdab407f47afaa8800af5006061db8dc92aae7';   // my cojam token address - Test 2

//const cojamMarketAddress = '0x9e42C6fBB5be3994994a0a9e68Ea64a696CC6fD7';  // KAS wallet address - dev

//const cojamTokenAddress = '0xd6cdab407f47afaa8800af5006061db8dc92aae7';   // token address - dev
const cojamMarketAddress = '0x864804674770a531b1cd0CC66DF8e5b12Ba84A09';  // klaytn contract marketAddress - dev

//const cojamMarketAddress = '0x3185c5e6c5f095e484b4335d8d88d0b7aabdd97e';


// cojam token address ?
const cojamToken = new caver.kct.kip7(cojamTokenAddress);

//const CojamContract = new caver.contract(abiJson2, cojamTokenAddress);



export const kaikasLogin = async () => {
  try {
    if (typeof window.klaytn !== 'undefined') {
      const accounts = await window.klaytn.enable();

      const account = accounts[0]; // We currently only ever provide a single account,
      console.log(`지갑주소 : ${account}`);
      console.log(`네트워크 주소 : ${window.klaytn.networkVersion}`);
      return account;
    } else {
      toastNotify({
        state: 'error',
        message: 'Please install Kaikas wallet.',
      });
    }
  } catch (error) {
    console.error('kaikasLogin', error);
  }
};

export const kaikasGetBalance = async (address) => {
  try {
    const balance = await caver.rpc.klay.getBalance(address);
    console.log(`현재 잔액 : ${balance / 10 ** 18}`);
    return balance;
  } catch (error) {
    console.error('kaikasGetBalance', error);
  }
};

export const isKaikasUnlocked = async () => {
  try {
    const result = await window.klaytn?._kaikas.isUnlocked();
    return result; //잠금상태: false, 열린상태: true
  } catch (error) {
    console.error('isKaikasUnlocked', error);
  }
};

export const isKaikasEnabled = async () => {
  try {
    const result = await window.klaytn?._kaikas.isEnabled();
    return result;
  } catch (error) {
    console.error('isKaikasEnabled', error);
  }
};


export const getCojamBalance = async (walletAddress) => {
  if(walletAddress) {
    try {
      const tokenBalance = await cojamToken.balanceOf(walletAddress).then((balance) => {
        return balance.integerValue();
      });
      
      console.log('token balance', tokenBalance);
      return tokenBalance;  
    } catch(e) {
      console.log('cojam balance error', e);
      return 0;
    }
  }
}

/**
 * Ground Status 변경 Functions 시작
 */
export const draftMarket = async ({
  marketKey,
  creator,
  title,
  creatorFee,
  creatorFeePercentage,
  cojamFeePercentage,
  charityFeePercentage
}) => {
  const contractABI = [{
    name: 'draftMarket',
    type: 'function',
    inputs: [
      {
        type: 'uint256',
        name: 'marketKey'
      },
      {
        type: 'address',
        name: 'creator'
      },
      {
        type: 'string',
        name: 'title'
      },
      {
        type: 'uint256',
        name: 'creatorFee'
      },
      {
        type: 'uint256',
        name: 'creatorFeePercentage'
      },
      {
        type: 'uint256',
        name: 'cojamFeePercentage'
      },
      {
        type: 'uint256',
        name: 'charityFeePercentage'
      }
    ]
  }];

  if(!klaytn.selectedAddress) {
    return {
      status: false,
    }
  }

  const contractAddress = cojamMarketAddress;
  const contract = new caver.klay.Contract(contractABI, contractAddress)

  let result = { spenderAddress: cojamMarketAddress };
  await contract.methods.draftMarket(
    marketKey, creator, title, creatorFee, creatorFeePercentage, cojamFeePercentage, charityFeePercentage
  )
  .send({from: klaytn.selectedAddress, to: cojamMarketAddress, gas: '9000000'})
  .then(function(receipt) {
    console.log('draft receipt', receipt);
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status;
  });

  return result;
}

export const approveMarket = async ({
  marketKey
}) => {
  const contractABI = [{
    name: 'approveMarket',
    type: 'function',
    inputs: [
      {
        type: 'uint256',
        name: 'marketKey'
      }
    ]
  }];

  const contractAddress = cojamMarketAddress;
  const contract = new caver.klay.Contract(contractABI, contractAddress)

  let result = { spenderAddress: cojamMarketAddress };
  await contract.methods.approveMarket(
    marketKey
  )
  .send({from: klaytn.selectedAddress, to: cojamMarketAddress, gas: '9000000'})
  .then(function(receipt) {
    console.log('approve receipt', receipt);
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status;
  });

  return result;
}

export const adjournMarket = async ({
  marketKey
}) => {
  const contractABI = [{
    name: 'adjournMarket',
    type: 'function',
    inputs: [
      {
        type: 'uint256',
        name: 'marketKey'
      }
    ]
  }];

  const contractAddress = cojamMarketAddress;
  const contract = new caver.klay.Contract(contractABI, contractAddress)

  let result = { spenderAddress: cojamMarketAddress };
  await contract.methods.adjournMarket(
    marketKey
  )
  .send({from: klaytn.selectedAddress, to: cojamMarketAddress, gas: '9000000'})
  .then(function(receipt) {
    console.log('adjourn receipt', receipt);
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status;
  });

  return result;
}

export const finishMarket = async ({
  marketKey
}) => {
  const contractABI = [{
    name: 'finishMarket',
    type: 'function',
    inputs: [
      {
        type: 'uint256',
        name: 'marketKey'
      }
    ]
  }];

  const contractAddress = cojamMarketAddress;
  const contract = new caver.klay.Contract(contractABI, contractAddress)

  let result = { spenderAddress: cojamMarketAddress };
  await contract.methods.finishMarket(
    marketKey
  )
  .send({from: klaytn.selectedAddress, to: cojamMarketAddress, gas: '9000000'})
  .then(function(receipt) {
    console.log('finish receipt', receipt);
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status;
  });

  return result;
}

export const addAnswerKeys = async ({
  marketKey,
  answerKeys
}) => {
  const contractABI = [{
    name: 'addAnswerKeys',
    type: 'function',
    inputs: [
      {
        type: 'uint256',
        name: 'marketKey'
      },
      {
        type: 'uint256[]',
        name: 'answerKeys'
      }
    ]
  }];

  const contractAddress = cojamMarketAddress;
  const contract = new caver.klay.Contract(contractABI, contractAddress)

  let result = { spenderAddress: cojamMarketAddress };
  await contract.methods.addAnswerKeys(
    marketKey, answerKeys
  )
  .send({from: klaytn.selectedAddress, to: cojamMarketAddress, gas: '9000000'})
  .then(function(receipt) {
    console.log('addAnswerKeys receipt', receipt);
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status;
  });

  return result;
}


export const retrieveMarket = async ({
  marketKey
}) => {
  const contractABI = [{
    name: 'retrieveMarket',
    type: 'function',
    inputs: [
      {
        type: 'uint256',
        name: 'marketKey'
      }
    ]
  }];

  const contractAddress = cojamMarketAddress;
  const contract = new caver.klay.Contract(contractABI, contractAddress)

  let result = { spenderAddress: cojamMarketAddress };
  await contract.methods.retrieveMarket(
    marketKey
  )
  .send({from: klaytn.selectedAddress, to: cojamMarketAddress, gas: '9000000'})
  .then(function(receipt) {
    console.log('retrieveMarket receipt', receipt);
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status;
  });

  return result;
}


export const successMarket = async ({
  questKey,
  questAnswerKey
}) => {
  const contractABI = [{
    name: 'successMarket',
    type: 'function',
    inputs: [
      {
        type: 'uint256',
        name: 'marketKey'
      },
      {
        type: 'uint256',
        name: 'selectedAnswerKey'
      }
    ]
  }];

  const contractAddress = cojamMarketAddress;
  const contract = new caver.klay.Contract(contractABI, contractAddress)

  console.log('success !!!!', klaytn.selectedAddress);

  let result = { spenderAddress: cojamMarketAddress };
  await contract.methods.successMarket(
    questKey, questAnswerKey
  )
  .send({from: klaytn.selectedAddress, to: cojamMarketAddress, gas: '9000000'})
  .then(function(receipt) {
    console.log('successMarket receipt', receipt);
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status;
  });

  return result;
}
/**
 * Ground Status 변경 Functions 끝
 */


export const getMarketCojamURI = async ({
  marketKey
}) => {
  const contractABI = [{
    name: 'getMarket',
    type: 'function',
    inputs: [
      {
        type: 'uint256',
        name: 'marketKey'
      }
    ]
  }];

  const contractAddress = cojamMarketAddress;
  const myContract = new caver.klay.Contract(contractABI, contractAddress)

  let result = { spenderAddress: cojamMarketAddress };
  await myContract.methods.getMarket(
    marketKey
  )
  .send({from: klaytn.selectedAddress, to: cojamMarketAddress, gas: '9000000'})
  .then(function(receipt) {
    console.log('market receipt', receipt);
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status;
  })

  return result;  
}


// POINT
export const bettingCojamURI = async ({
  questKey,
  questAnswerKey,
  bettingKey,
  bettingCoinAmount
}) => {
  const contractABI = [{
    name: 'bet',
    type: 'function',
    inputs: [
      {
        type: 'uint256',
        name: 'marketKey'
      },
      {
        type: 'uint256',
        name: 'answerKey'
      },
      {
        type: 'uint256',
        name: 'bettingKey'
      },
      {
        type: 'uint256',
        name: 'tokens'
      }
    ]
  }];

  const contract = new caver.klay.Contract(contractABI, cojamMarketAddress);

  let result = { spenderAddress: cojamMarketAddress };
  await contract.methods.bet(
    questKey, questAnswerKey, bettingKey, caver.utils.toPeb(Number(bettingCoinAmount), 'KLAY')
  )
  .send({from: klaytn.selectedAddress, value: 0, gas: '9000000'})
  .then(function(receipt) {
    console.log('betting receipt', receipt);
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status;
  });

  return result;
}


export const approveCojamURI = async (
  bettingCoinAmount
) => { 
  const contractABI = [{
    name: 'approve',
    type: 'function',
    inputs: [
      {
        type: 'address',
        name: 'spender'
      },
      {
        type: 'uint256',
        name: 'amount'
      }
    ]
  }];

  const myContract = new caver.klay.Contract(contractABI, cojamTokenAddress);

  let result = { spenderAddress: cojamMarketAddress };
  await myContract.methods.approve(
    cojamMarketAddress, caver.utils.toPeb(Number(bettingCoinAmount), 'KLAY')
  )
  .send({from: klaytn.selectedAddress, value: 0, gas: '9000000'})
  .then(function(receipt) {
    console.log('approve receipt', receipt);
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status;
  })

  return result;  
}

export const receiveToken = async ({
  questKey,
  bettingKey
}) => {
  const contractABI = [{
    name: 'receiveToken',
    type: 'function',
    inputs: [
      {
        type: 'uint256',
        name: 'marketKey'
      },
      {
        type: 'uint256',
        name: 'bettingKey'
      }
    ]
  }];

  const contractAddress = cojamMarketAddress;
  const contract = new caver.klay.Contract(contractABI, contractAddress);

  let result = { spenderAddress: cojamMarketAddress };
  await contract.methods.receiveToken(
    questKey, bettingKey
  )
  .send({from: klaytn.selectedAddress, to: cojamMarketAddress, gas: '9000000'})
  .then(function(receipt) {
    console.log('receive token receipt', receipt);
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status;
  });

  return result;
}

export const setAccounts = async ({
  key,
  account
}) => {
  const contractABI = [{
    name: 'setAccount',
    type: 'function',
    inputs: [
      {
        type: 'string',
        name: 'key'
      },
      {
        type: 'address',
        name: 'account'
      }
    ]
  }];


  const feeAddress = '0x6b35e1a72f97320945789b3e7c6a203de1c4f0d3';
  const charityAddress = '0xe3469be62a72988a5462c413aef4d6efd59fff3d';
  const remainAddress = '0x4a1667cf934796067adbddf456c95ef91658b403';


  const contractAddress = cojamMarketAddress;
  const contract = new caver.klay.Contract(contractABI, contractAddress)

  console.log('success !!!!', klaytn.selectedAddress);

  let result = { spenderAddress: cojamMarketAddress };
  await contract.methods.setAccount(
    key, account
  )
  .send({from: klaytn.selectedAddress, to: cojamMarketAddress, gas: '9000000'})
  .then(function(receipt) {
    console.log('successMarket receipt', receipt);
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status;
  });

  return result;
}