import Caver from 'caver-js';
import CaverExtKAS from 'caver-js-ext-kas';
import toastNotify from '@utils/toast';

import axios from 'axios';

const caver = new Caver(window.klaytn);

// baobab: 1001, cypress: 8217
const caverExt = new CaverExtKAS('8217', 'KASKABM99U30BTVDXCYDMQQF', 'P6vSKCjKxYuXdpp7e1H7JJjQNVvjwr46FYdcZhdm', { useNodeAPIWithHttp: true });

const cojamTokenAddress = '0x7f223b1607171b81ebd68d22f1ca79157fd4a44b';   // prod
//const cojamTokenAddress = "0xd6cdab407f47afaa8800af5006061db8dc92aae7";   // dev

const cojamMarketAddress = '0x2078466926E4Af541DC47d954C487517bcE49c28' // prod
//const cojamMarketAddress = '0x864804674770a531b1cd0CC66DF8e5b12Ba84A09';  // dev

// cojam token address ?
const cojamToken = new caver.kct.kip7(cojamTokenAddress);

export const kaikasLogin = async () => {
  try {
    if (typeof window.klaytn !== 'undefined') {
      const accounts = await window.klaytn.enable();

      const account = accounts[0]; // We currently only ever provide a single account,
      //console.log(`지갑주소 : ${account}`);
      //console.log(`네트워크 주소 : ${window.klaytn.networkVersion}`);
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
      
      return tokenBalance;  
    } catch(e) {
      console.log('cojam balance error', e);
      return 0;
    }
  }
}

export const transferOwnership = async (walletAddress) => {
  const contractABI = [{
    name: 'transferOwnership',
    type: 'function',
    inputs: [
      {
        type: 'address',
        name: 'newOwner'
      }
    ]
  }];

  const contractAddress = cojamMarketAddress;
  const contract = new caver.klay.Contract(contractABI, contractAddress)

  let result = { spenderAddress: walletAddress, status: 400 };
  await contract.methods.transferOwnership(
    walletAddress
  )
  .send({from: klaytn.selectedAddress, to: contractAddress, gas: '9000000'})
  .then(function(receipt) {
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status ? 200 : 400;
  });

  return result;
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
  
  const contractAddress = cojamMarketAddress;
  const contract = new caver.klay.Contract(contractABI, contractAddress)

  let result = { spenderAddress: contractAddress, status: 400 };
  await contract.methods.draftMarket(
    marketKey, creator, title, creatorFee, creatorFeePercentage, cojamFeePercentage, charityFeePercentage
  )
  .send({from: klaytn.selectedAddress, to: contractAddress, gas: '9000000'})
  .then(function(receipt) {
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status ? 200 : 400;
  });

  return result;
}

export const approveMarket = async (
  marketKey
) => {
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

  let result = { spenderAddress: contractAddress, status: 400 };
  await contract.methods.approveMarket(
    marketKey
  )
  .send({from: klaytn.selectedAddress, to: contractAddress, gas: '9000000'})
  .then(function(receipt) {
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status ? 200 : 400;
  });

  return result;
}

export const adjournMarket = async (
  marketKey
) => {
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

  let result = { spenderAddress: contractAddress, status: 400 };
  await contract.methods.adjournMarket( 
    marketKey 
  )
  .send({from: klaytn.selectedAddress, to: contractAddress, gas: '9000000'})
  .then(function(receipt) {
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status ? 200 : 400;
  });

  return result;
}

export const finishMarket = async (
  marketKey
) => {
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

  let result = { spenderAddress: contractAddress, status: 400 };
  await contract.methods.finishMarket(
    marketKey
  )
  .send({from: klaytn.selectedAddress, to: contractAddress, gas: '9000000'})
  .then(function(receipt) {
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status ? 200 : 400;
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
  
    let result = { spenderAddress: contractAddress, status: 400 };
    await contract.methods.addAnswerKeys(
      marketKey, answerKeys
    )
    .send({from: klaytn.selectedAddress, to: contractAddress, gas: '9000000'})
    .then(function(receipt) {
      result.transactionId = receipt.transactionHash;
      result.status = receipt.status ? 200 : 400;
    });
  
    return result;
}


export const retrieveMarket = async ({
  questKey
}) => {
  const contractABI = [{
    name: 'retrievedMarket',
    type: 'function',
    inputs: [
      {
        type: 'uint256',
        name: 'marketKey'
      }
    ]
  }];

  const contract = new caver.klay.Contract(contractABI, cojamMarketAddress);

  let result = { spenderAddress: cojamMarketAddress, status: 400 };
  await contract.methods.retrievedMarket(
    questKey
  )
  .send({from: klaytn.selectedAddress, to: cojamMarketAddress, gas: '9000000'})
  .then(function(receipt) {
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status ? 200 : 400;
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

  let result = { spenderAddress: contractAddress, status: 400 };
  await contract.methods.successMarket(
    questKey, questAnswerKey
  )
  .send({from: klaytn.selectedAddress, to: contractAddress, gas: '9000000'})
  .then(function(receipt) {
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status ? 200 : 400;
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

  let result = { spenderAddress: contractAddress, status: 400 };
  await myContract.methods.getMarket(
    marketKey
  )
  .send({from: klaytn.selectedAddress, to: contractAddress, gas: '9000000'})
  .then(function(receipt) {
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status ? 200 : 400;
  })

  return result;  
}

/**
 * Quest Betting function
 */
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

  let result = { spenderAddress: cojamMarketAddress, status: 400 };
  await contract.methods.bet(
    questKey, questAnswerKey, bettingKey, caver.utils.toPeb(Number(bettingCoinAmount), 'KLAY')
  )
  .send({from: klaytn.selectedAddress, value: 0, gas: '9000000'})
  .then(function(receipt) {
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status ? 200 : 400;
  });

  return result;
}


/**
 * Quest Betting Approve function
 */
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

  let result = { spenderAddress: cojamMarketAddress, status: 400 };
  await myContract.methods.approve(
    cojamMarketAddress, caver.utils.toPeb(Number(bettingCoinAmount), 'KLAY')
  )
  .send({from: klaytn.selectedAddress, value: 0, gas: '9000000'})
  .then(function(receipt) {
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status ? 200 : 400;
  })

  return result;  
}


/**
 * get Join or Login Reward
 * @param {*} param0 
 * @returns 
 */
export const getRewardCojamURI = async ({
  fromAddress, toAddress, amount
}) => {
  const inputData = await caverExt.klay.abi.encodeFunctionCall({
    name: 'transfer',
    type: 'function',
    inputs: [{
        type: 'address',
        name: 'to'
    }, {
        type: 'uint256',
        name: 'amount'
    }]
  }, [toAddress, caver.utils.toPeb(Number(amount), 'KLAY')])

  /*
  'x-krn': 'krn:8217:wallet:737eb99e-bce5-4daf-9ad2-45f2bef83c2a:feepayer-pool:Cojam',
  Authorization: 'Basic S0FTS0FDUktIQ0VSVFo0WVhETTNNOUFVOmpEb3FadnhWMnpXOS1fUnRNRWxlUTc4aGVBaF9IRVlJQzZlb3V2UHM='
  */

  /*
  'x-krn': 'krn:1001:wallet:737eb99e-bce5-4daf-9ad2-45f2bef83c2a:account-pool:Reward',
  Authorization: 'Basic S0FTS0FCTTk5VTMwQlRWRFhDWURNUVFGOlA2dlNLQ2pLeFl1WGRwcDdlMUg3SkpqUU5Wdmp3cjQ2RllkY1poZG0='
  */

  var options = {
    method: 'POST',
    url: 'https://wallet-api.klaytnapi.com/v2/tx/fd/contract/execute',
    headers: {
        'Content-Type': 'application/json',
        'x-chain-id': '8217', // 1001 or 8217
        'x-krn': 'krn:8217:wallet:737eb99e-bce5-4daf-9ad2-45f2bef83c2a:feepayer-pool:Cojam',
        Authorization: 'Basic S0FTS0FDUktIQ0VSVFo0WVhETTNNOUFVOmpEb3FadnhWMnpXOS1fUnRNRWxlUTc4aGVBaF9IRVlJQzZlb3V2UHM='
    },
    data: {
        from: fromAddress,
        value: '0x0',
        to: cojamTokenAddress,
        input: inputData,
        nonce: 0,
        gas: 999999,
        submit: true
    }
  };

  const result = { spenderAddress: fromAddress };
  await axios.request(options).then(function (response) {
    result.status = 200;
  }).catch(function (error) {
    console.error(error);
    result.status = 400;
  });

  return result;
}

/**
 * Cojam Token transfer function 
 */
export const transferCojamURI = async ({
  fromAddress, toAddress, amount
}) => {

  const contractABI = [{
    name: 'transfer',
    type: 'function',
    inputs: [{
        type: 'address',
        name: 'to'
    }, {
        type: 'uint256',
        name: 'amount'
    }]
  }];

  const contract = new caver.klay.Contract(contractABI, cojamTokenAddress);

  let result = { spenderAddress: fromAddress };
  await contract.methods.transfer(
    toAddress, caver.utils.toPeb(Number(amount), 'KLAY')
  )
  .send({from: fromAddress, value: 0, gas: '9000000'})
  .then(function(receipt) {
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status ? 200 : 400;
  })
  .catch(function(err) {
    console.log('err', err);
    result.status = 400;
  });

  return result;
}

/**
 * Cojam Token transferFrom function 
export const transferFromCojamURI = async ({
  fromAddress, toAddress, amount
}) => {
  const contractABI = [{
    name: 'transferFrom',
    type: 'function',
    inputs: [
      {
        type: 'address',
        name: 'from'
      },
      {
        type: 'address',
        name: 'to'
      },
      {
        type: 'uint256',
        name: 'amount'
      }
    ]
  }];

  const contract = new caverExt.klay.Contract(contractABI, cojamTokenAddress);

  let result = { spenderAddress: fromAddress };
  await contract.methods.transferFrom(
    fromAddress, toAddress, caver.utils.toPeb(Number(amount), 'KLAY')
  )
  .call({from: klaytn.selectedAddress, value: 0, gas: '9000000'})
  .then(function(receipt) {
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status ? 200 : 400;
  });

  return result;
}
 */

export const receiveToken = async (
  questKey,
  bettingKey
) => {
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

  let result = { spenderAddress: contractAddress, status: 400 };
  await contract.methods.receiveToken(
    questKey, bettingKey
  )
  .send({from: klaytn.selectedAddress, to: contractAddress, gas: '9000000'})
  .then(function(receipt) {
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status ? 200 : 400;
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

  const contractAddress = cojamMarketAddress;
  const contract = new caver.klay.Contract(contractABI, contractAddress);

  let result = { spenderAddress: cojamMarketAddress, status: 400 };
  await contract.methods.setAccount(
    key, account
  )
  .send({from: klaytn.selectedAddress, to: cojamMarketAddress, gas: '9000000'})
  .then(function(receipt) {
    result.transactionId = receipt.transactionHash;
    result.status = receipt.status ? 200 : 400;
  });

  return result;
}