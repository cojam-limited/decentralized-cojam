import Caver from 'caver-js';
import CaverExtKAS from 'caver-js-ext-kas';
import toastNotify from '@utils/toast';

import axios from 'axios';

import { prepare } from 'klip-sdk';

const caver = new Caver(window.klaytn);
const caverExt = new CaverExtKAS('1001', 'KASKABM99U30BTVDXCYDMQQF', 'P6vSKCjKxYuXdpp7e1H7JJjQNVvjwr46FYdcZhdm', { useNodeAPIWithHttp: true });

//const cojamTokenAddress = '0x7f223b1607171b81ebd68d22f1ca79157fd4a44b';   // contract address - prod
//const cojamTokenAddress = '0xbb1cafc1444fbd3df6d233e232463154eb17db38';   // my cojam token address - dev
const cojamTokenAddress = "0xd6cdab407f47afaa8800af5006061db8dc92aae7";   // my cojam token address - Test 2

//const cojamMarketAddress = '0x9e42C6fBB5be3994994a0a9e68Ea64a696CC6fD7';  // KAS wallet address - dev
const cojamMarketAddress = '0x864804674770a531b1cd0CC66DF8e5b12Ba84A09';  // klaytn contract marketAddress - dev

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

/**
 * Ground Status 변경 Functions 시작
 */
export const draftMarket_KLIP = async ({
  marketKey,
  creator,
  title,
  creatorFee,
  creatorFeePercentage,
  cojamFeePercentage,
  charityFeePercentage,
}, fromAddress) => {
  const bappName = 'cojam-v2';
  const from = fromAddress;
  const to = cojamMarketAddress;
  const value = '0'
  const abi = "{\"constant\":false, " + 
              "\"inputs\":"+
                "[" +
                  "{\"name\":\"marketKey\",\"type\":\"uint256\"}," +
                  "{\"name\":\"creator\",\"type\":\"address\"}," +
                  "{\"name\":\"title\",\"type\":\"string\"}," +
                  "{\"name\":\"creatorFee\",\"type\":\"uint256\"}," +
                  "{\"name\":\"creatorFeePercentage\",\"type\":\"uint256\"}," +
                  "{\"name\":\"cojamFeePercentage\",\"type\":\"uint256\"}," +
                  "{\"name\":\"charityFeePercentage\",\"type\":\"uint256\"}" +
                "]," +
              "\"name\":\"draftMarket\"," +
              "\"output\": [], \"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  const params = `[${marketKey},"${creator}","${title}",${creatorFee},${creatorFeePercentage},${cojamFeePercentage},${charityFeePercentage}}]`;
  
  const result = { spenderAddress: fromAddress, status: 400 };
  const res = await prepare.executeContract({ bappName, from, to, value, abi, params });
  if (res.err) {
    // 에러 처리
    console.log('draftMarket error', res.err);
  } else if (res.request_key) {
    // request_key 보관
    console.log('draftMarket done', res.request_key);
    result.status = 200;
  }

  return result;
}

export const approveMarket_KLIP = async (
  { marketKey }, fromAddress
) => {
  const bappName = 'cojam-v2';
  const from = fromAddress;
  const to = cojamMarketAddress;
  const value = '0'
  const abi = "{\"constant\":false, " + 
              "\"inputs\":"+
                "[" +
                  "{\"name\":\"marketKey\",\"type\":\"uint256\"}" +
                "]," +
              "\"name\":\"approveMarket\"," +
              "\"output\": [], \"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  const params = `[${marketKey}}]`;
  
  const result = { spenderAddress: fromAddress, status: 400 };
  const res = await prepare.executeContract({ bappName, from, to, value, abi, params });
  if (res.err) {
    // 에러 처리
    console.log('approveMarket error', res.err);
  } else if (res.request_key) {
    // request_key 보관
    console.log('approveMarket done', res.request_key);
    result.status = 200;
  }

  return result;
}

export const adjournMarket_KLIP = async (
  { marketKey }, fromAddress
) => {
  const bappName = 'cojam-v2';
  const from = fromAddress;
  const to = cojamMarketAddress;
  const value = '0'
  const abi = "{\"constant\":false, " + 
              "\"inputs\":"+
                "[" +
                  "{\"name\":\"marketKey\",\"type\":\"uint256\"}" +
                "]," +
              "\"name\":\"adjournMarket\"," +
              "\"output\": [], \"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  const params = `[${marketKey}}]`;
  
  const result = { spenderAddress: fromAddress, status: 400 };
  const res = await prepare.executeContract({ bappName, from, to, value, abi, params });
  if (res.err) {
    // 에러 처리
    console.log('adjournMarket error', res.err);
  } else if (res.request_key) {
    // request_key 보관
    console.log('adjournMarket done', res.request_key);
    result.status = 200;
  }

  return result;
}

export const finishMarket_KLIP = async (
  { marketKey }, fromAddress
) => {
  const bappName = 'cojam-v2';
  const from = fromAddress;
  const to = cojamMarketAddress;
  const value = '0'
  const abi = "{\"constant\":false, " + 
              "\"inputs\":"+
                "[" +
                  "{\"name\":\"marketKey\",\"type\":\"uint256\"}" +
                "]," +
              "\"name\":\"finishMarket\"," +
              "\"output\": [], \"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  const params = `[${marketKey}}]`;
  
  const result = { spenderAddress: fromAddress, status: 400 };
  const res = await prepare.executeContract({ bappName, from, to, value, abi, params });
  if (res.err) {
    // 에러 처리
    console.log('finishMarket error', res.err);
  } else if (res.request_key) {
    // request_key 보관
    console.log('finishMarket done', res.request_key);
    result.status = 200;
  }

  return result;
}

export const addAnswerKeys_KLIP = async ({
  marketKey,
  answerKeys 
}, 
fromAddress
) => {
  const bappName = 'cojam-v2';
  const from = fromAddress;
  const to = cojamMarketAddress;
  const value = '0'
  const abi = "{\"constant\":false, " + 
              "\"inputs\":"+
                "[" +
                  "{\"name\":\"marketKey\",\"type\":\"uint256\"}," +
                  "{\"name\":\"answerKeys\",\"type\":\"uint256[]\"}" +
                "]," +
              "\"name\":\"addAnswerKeys\"," +
              "\"output\": [], \"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  const params = `[${marketKey},"${answerKeys}"}]`;
  
  const result = { spenderAddress: fromAddress, status: 400 };
  const res = await prepare.executeContract({ bappName, from, to, value, abi, params });
  if (res.err) {
    // 에러 처리
    console.log('addAnswerKeys error', res.err);
  } else if (res.request_key) {
    // request_key 보관
    console.log('addAnswerKeys done', res.request_key);
    result.status = 200;
  }

  return result;
}


export const retrieveMarket_KLIP = async ({
  questKey  
}, 
fromAddress
) => {
  const bappName = 'cojam-v2';
  const from = fromAddress;
  const to = cojamMarketAddress;
  const value = '0'
  const abi = "{\"constant\":false, " + 
              "\"inputs\":"+
                "[" +
                  "{\"name\":\"marketKey\",\"type\":\"uint256\"}" +
                "]," +
              "\"name\":\"retrievedMarket\"," +
              "\"output\": [], \"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  const params = `[${questKey},${questAnswerKey}}]`;
  
  const result = { spenderAddress: fromAddress, status: 400 };
  const res = await prepare.executeContract({ bappName, from, to, value, abi, params });
  if (res.err) {
    // 에러 처리
    console.log('retrieveMarket error', res.err);
  } else if (res.request_key) {
    // request_key 보관
    console.log('retrieveMarket done', res.request_key);
    result.status = 200;
  }

  return result;
}


export const successMarket_KLIP = async ({
  questKey,
  questAnswerKey  
},
fromAddress
) => {
  const bappName = 'cojam-v2';
  const from = fromAddress;
  const to = cojamMarketAddress;
  const value = '0'
  const abi = "{\"constant\":false, " + 
              "\"inputs\":"+
                "[" +
                  "{\"name\":\"marketKey\",\"type\":\"uint256\"}," +
                  "{\"name\":\"selectedAnswerKey\",\"type\":\"uint256\"}" +
                "]," +
              "\"name\":\"successMarket\"," +
              "\"output\": [], \"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  const params = `[${questKey},${questAnswerKey}}]`;
  
  const result = { spenderAddress: fromAddress, status: 400 };
  const res = await prepare.executeContract({ bappName, from, to, value, abi, params });
  if (res.err) {
    // 에러 처리
    console.log('successMarket error', res.err);
  } else if (res.request_key) {
    // request_key 보관
    console.log('successMarket done', res.request_key);
    result.status = 200;
  }

  return result;
}
/**
 * Ground Status 변경 Functions 끝
 */


/**
 * Quest Betting function
 */
export const bettingCojamURI_KLIP = async ({
  questKey,
  questAnswerKey,
  bettingKey,
  bettingCoinAmount
}, 
fromAddress
) => {
  const bappName = 'cojam-v2';
  const from = fromAddress;
  const to = cojamMarketAddress;
  const value = '0'
  const abi = "{\"constant\":false, " + 
              "\"inputs\":"+
                "[" +
                  "{\"name\":\"marketKey\",\"type\":\"uint256\"}," +
                  "{\"name\":\"answerKey\",\"type\":\"uint256\"}," +
                  "{\"name\":\"bettingKey\",\"type\":\"uint256\"}," +
                  "{\"name\":\"tokens\",\"type\":\"uint256\"}" +
                "]," +
              "\"name\":\"bet\"," +
              "\"output\": [], \"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  const params = `[${questKey},${questAnswerKey},${bettingKey},${caver.utils.toPeb(Number(bettingCoinAmount), 'KLAY')}]`;
  
  const result = { spenderAddress: fromAddress, status: 400 };
  const res = await prepare.executeContract({ bappName, from, to, value, abi, params });
  if (res.err) {
    // 에러 처리
    console.log('bettingCojamURI error', res.err);
  } else if (res.request_key) {
    // request_key 보관
    console.log('bettingCojamURI done', res.request_key);
    result.status = 200;
  }

  return result;
}


/**
 * Quest Betting Approve function
 */
export const approveCojamURI_KLIP = async (
  {bettingCoinAmount}, fromAddress
) => { 
  const bappName = 'cojam-v2';
  const from = fromAddress;
  const to = cojamTokenAddress;
  const value = '0'
  const abi = "{\"constant\":false, " +
              "\"inputs\":[{\"name\":\"spender\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}]," +
              "\"name\":\"approve\"," +
              "\"output\": [], \"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  const params =  "[\"" + cojamMarketAddress + "\", " + caver.utils.toPeb(Number(bettingCoinAmount)) + "]";
  
  const result = { spenderAddress: fromAddress, status: 400 };
  const res = await prepare.executeContract({ bappName, from, to, value, abi, params });
  if (res.err) {
    // 에러 처리
    console.log('approveCojamURI error', res.err);
  } else if (res.request_key) {
    // request_key 보관
    console.log('approveCojamURI done', res.request_key);
    result.status = 200;
  }

  return result;
}


/**
 * Cojam Token transfer function 
 */
export const transferCojamURI_KLIP = async ({
  fromAddress, 
  toAddress, 
  amount
}) => {
  const bappName = 'cojam-v2';
  const from = fromAddress;
  const to = cojamTokenAddress;
  const value = '0'
  const abi = "{\"constant\":false, " + 
              "\"inputs\":"+
                "[" +
                  "{\"name\":\"to\",\"type\":\"address\"}," +
                  "{\"name\":\"amount\",\"type\":\"uint256\"}" +
                "]," +
              "\"name\":\"transfer\"," +
              "\"output\": [], \"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  
  const params = `["${toAddress}",${ caver.utils.toPeb(Number(amount))}}]`;
  const result = { spenderAddress: fromAddress, status: 400 };
  const res = await prepare.executeContract({ bappName, from, to, value, abi, params });
  if (res.err) {
    // 에러 처리
    console.log('transfer error', res.err);
  } else if (res.request_key) {
    // request_key 보관
    console.log('transfer done', res.request_key);
    result.status = 200;
  }

  return result;
}

export const transferOwnership_KLIP = async (
  walletAddress,
  fromAddress
) => {
  const bappName = 'cojam-v2';
  const from = fromAddress;
  const to = cojamTokenAddress;
  const value = '0'
  const abi = "{\"constant\":false, " + 
              "\"inputs\":"+
                "[" +
                  "{\"name\":\"newOwner\",\"type\":\"address\"}" +
                "]," +
              "\"name\":\"transferOwnership\"," +
              "\"output\": [], \"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  
  const params = `["${walletAddress}"}]`;
  const result = { spenderAddress: fromAddress, status: 400 };
  const res = await prepare.executeContract({ bappName, from, to, value, abi, params });
  if (res.err) {
    // 에러 처리
    console.log('transferOwnership error', res.err);
  } else if (res.request_key) {
    // request_key 보관
    console.log('transferOwnership done', res.request_key);
    result.status = 200;
  }

  return result;
}