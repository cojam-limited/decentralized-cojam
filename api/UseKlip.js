import Caver from 'caver-js';
import toastNotify from '@utils/toast';

import axios from 'axios';

import { prepare, request, getResult } from 'klip-sdk';

const caver = new Caver(window.klaytn);

const xChainId = '1001'; // dev
//const xChainId = '8217'; // prod

const cojamTokenAddress = '0x7f223b1607171b81ebd68d22f1ca79157fd4a44b';   // prod
//const cojamTokenAddress = "0xd6cdab407f47afaa8800af5006061db8dc92aae7";   // dev

const cojamMarketAddress = '0xC31585Bf0808Ab4aF1acC29E0AA6c68D2B4C41CD' // prod
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


export const getCojamBalance_KLIP = async (walletAddress) => {
  if(walletAddress) {
    const tokenAddress = '0x3185c5e6c5f095e484b4335d8d88d0b7aabdd97e';

    const options = {
      method: 'POST',
      url: `https://kip7-api.klaytnapi.com/v1/contract/${tokenAddress}/account/${walletAddress}/balance`,
      headers: {
          'Content-Type': 'application/json',
          'x-chain-id': `${xChainId}`,
          'x-krn': `krn:1001:wallet:737eb99e-bce5-4daf-9ad2-45f2bef83c2a:feepayer-pool:cojamfee`,
          Authorization: 'Basic S0FTS0FCTTk5VTMwQlRWRFhDWURNUVFGOlA2dlNLQ2pLeFl1WGRwcDdlMUg3SkpqUU5Wdmp3cjQ2RllkY1poZG0='
      }
    };
  
    const result = {};
    await axios.request(options).then(function (response) {
      console.log('reward', response);
      result.status = 200;
    }).catch(function (error) {
      console.error(error);
      result.status = 400;
    });

    return result;
  }

  return { status: 400 };
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
              "\"output\": [{\"name\":\"result\",\"type\":\"bool\"}], " +
              "\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  const params = `[${marketKey},"${creator}","${title}",${creatorFee},${creatorFeePercentage},${cojamFeePercentage},${charityFeePercentage}]`;
  
  const result = { spenderAddress: fromAddress, status: 400 };
  const res = await prepare.executeContract({ bappName, from, to, value, abi, params });
  if (res.err) {
    // TODO REMOVE
    alert('error', res.err);

    // 에러 처리
    console.log('draftMarket error', res.err);
  } else if (res.request_key) {
    // request_key 보관
    request(res.requestKey, () => { alert('모바일로 접속해주세요.'); return result; });

    let time = new Date().getTime();
    const endTime = time + 3000;
    while (time < endTime) {
      if( time % 500 === 0 ) {
        await getResult(res.request_key).then((txResult) => {
          console.log('txResult', txResult);

          // TODO REMOVE
          if(txResult.status !== 'prepared') {  
            alert('pass prepared!');
            alert(txResult);
            alert(txResult.status);
          }

          if(txResult.result?.result) {
            alert('transaction success', txResult.result?.result);
            result.status = txResult.result?.result ? 200 : 400;
            return result;
          }
        });
      } 

      time = new Date().getTime();
    }
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
              "\"output\": [{\"name\":\"result\",\"type\":\"bool\"}], " +
              "\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  const params = `[${marketKey}]`;
  
  const result = { spenderAddress: fromAddress, status: 400 };
  const res = await prepare.executeContract({ bappName, from, to, value, abi, params });
  if (res.err) {
    // 에러 처리
    console.log('approveMarket error', res.err);
  } else if (res.request_key) {
    // request_key 보관
    console.log('approveMarket request_key', res.request_key);
    request(res.requestKey, (result) => console.log(result));

    let time = new Date().getTime();
    const endTime = time + 3000;
    while (time < endTime) {
      if( time % 500 === 0 ) {
        await getResult(res.request_key).then((txResult) => {
          console.log('txResult', txResult);

          if(txResult.result?.result) {
            alert('transaction success', txResult.result?.result);
            result.status = txResult.result?.result ? 200 : 400;
          }
        });
      } 

      time = new Date().getTime();
    }
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
              "\"output\": [{\"name\":\"result\",\"type\":\"bool\"}], " +
              "\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  const params = `[${marketKey}]`;
  
  const result = { spenderAddress: fromAddress, status: 400 };
  const res = await prepare.executeContract({ bappName, from, to, value, abi, params });
  if (res.err) {
    // 에러 처리
    console.log('adjournMarket error', res.err);
  } else if (res.request_key) {
    // request_key 보관
    console.log('adjournMarket request_key', res.request_key);
    request(res.requestKey, (result) => console.log(result));

    let time = new Date().getTime();
    const endTime = time + 3000;
    while (time < endTime) {
      if( time % 500 === 0 ) {
        await getResult(res.request_key).then((txResult) => {
          console.log('txResult', txResult);

          if(txResult.result?.result) {
            alert('transaction success', txResult.result?.result);
            result.status = txResult.result?.result ? 200 : 400;
          }
        });
      } 

      time = new Date().getTime();
    }
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
              "\"output\": [{\"name\":\"result\",\"type\":\"bool\"}], " +
              "\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  const params = `[${marketKey}]`;
  
  const result = { spenderAddress: fromAddress, status: 400 };
  const res = await prepare.executeContract({ bappName, from, to, value, abi, params });
  if (res.err) {
    // 에러 처리
    console.log('finishMarket error', res.err);
  } else if (res.request_key) {
    // request_key 보관
    console.log('finishMarket request_key', res.request_key);
    request(res.requestKey, (result) => console.log(result));

    let time = new Date().getTime();
    const endTime = time + 3000;
    while (time < endTime) {
      if( time % 500 === 0 ) {
        await getResult(res.request_key).then((txResult) => {
          console.log('txResult', txResult);

          if(txResult.result?.result) {
            alert('transaction success', txResult.result?.result);
            result.status = txResult.result?.result ? 200 : 400;
          }
        });
      } 

      time = new Date().getTime();
    }
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
              "\"output\": [{\"name\":\"result\",\"type\":\"bool\"}], " +
              "\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  const params = `[${marketKey},"${answerKeys}"]`;
  
  const result = { spenderAddress: fromAddress, status: 400 };
  const res = await prepare.executeContract({ bappName, from, to, value, abi, params });
  if (res.err) {
    // 에러 처리
    console.log('addAnswerKeys error', res.err);
  } else if (res.request_key) {
    // request_key 보관
    console.log('addAnswerKeys request_key', res.request_key);
    request(res.requestKey, (result) => console.log(result));

    let time = new Date().getTime();
    const endTime = time + 3000;
    while (time < endTime) {
      if( time % 500 === 0 ) {
        await getResult(res.request_key).then((txResult) => {
          console.log('txResult', txResult);

          if(txResult.result?.result) {
            alert('transaction success', txResult.result?.result);
            result.status = txResult.result?.result ? 200 : 400;
          }
        });
      } 

      time = new Date().getTime();
    }
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
              "\"output\": [{\"name\":\"result\",\"type\":\"bool\"}], " +
              "\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  const params = `[${questKey},${questAnswerKey}]`;
  
  const result = { spenderAddress: fromAddress, status: 400 };
  const res = await prepare.executeContract({ bappName, from, to, value, abi, params });
  if (res.err) {
    // 에러 처리
    console.log('retrieveMarket error', res.err);
  } else if (res.request_key) {
    // request_key 보관
    console.log('retrieveMarket request_key', res.request_key);
    request(res.requestKey, (result) => console.log(result));

    let time = new Date().getTime();
    const endTime = time + 3000;
    while (time < endTime) {
      if( time % 500 === 0 ) {
        await getResult(res.request_key).then((txResult) => {
          console.log('txResult', txResult);

          if(txResult.result?.result) {
            alert('transaction success', txResult.result?.result);
            result.status = txResult.result?.result ? 200 : 400;
          }
        });
      } 

      time = new Date().getTime();
    }
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
              "\"output\": [{\"name\":\"result\",\"type\":\"bool\"}], " +
              "\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  const params = `[${questKey},${questAnswerKey}]`;
  
  const result = { spenderAddress: fromAddress, status: 400 };
  const res = await prepare.executeContract({ bappName, from, to, value, abi, params });
  if (res.err) {
    // 에러 처리
    console.log('successMarket error', res.err);
  } else if (res.request_key) {
    // request_key 보관
    console.log('successMarket request_key', res.request_key);
    request(res.requestKey, (result) => console.log(result));

    let time = new Date().getTime();
    const endTime = time + 3000;
    while (time < endTime) {
      if( time % 500 === 0 ) {
        await getResult(res.request_key).then((txResult) => {
          console.log('txResult', txResult);

          if(txResult.result?.result) {
            alert('transaction success', txResult.result?.result);
            result.status = txResult.result?.result ? 200 : 400;
          }
        });
      } 

      time = new Date().getTime();
    }
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
              "\"output\": [{\"name\":\"result\",\"type\":\"bool\"}], " +
              "\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  const params = `[${questKey},${questAnswerKey},${bettingKey},${caver.utils.toPeb(Number(bettingCoinAmount), 'KLAY')}]`;
  
  const result = { spenderAddress: fromAddress, status: 400 };
  const res = await prepare.executeContract({ bappName, from, to, value, abi, params });
  if (res.err) {
    // 에러 처리
    console.log('bettingCojamURI error', res.err);
  } else if (res.request_key) {
    // request_key 보관
    console.log('bettingCojamURI request_key', res.request_key);

    request(res.requestKey, (result) => console.log(result));

    let time = new Date().getTime();
    const endTime = time + 3000;
    while (time < endTime) {
      if( time % 500 === 0 ) {
        await getResult(res.request_key).then((txResult) => {
          console.log('txResult', txResult);

          // TODO REMOVE
          if(txResult.status !== 'prepared') {  
            alert('pass prepared!');
            alert(txResult);
            alert(txResult.status);
          }

          if(txResult.result?.result) {
            alert('transaction success', txResult.result?.result);
            result.status = txResult.result?.result ? 200 : 400;
          }
        });
      } 

      time = new Date().getTime();
    }
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
              "\"output\": [{\"name\":\"result\",\"type\":\"bool\"}], " +
              "\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  const params =  "[\"" + cojamMarketAddress + "\", " + caver.utils.toPeb(Number(bettingCoinAmount)) + "]";
  
  const result = { spenderAddress: fromAddress, status: 400 };
  const res = await prepare.executeContract({ bappName, from, to, value, abi, params });
  if (res.err) {
    // 에러 처리
    console.log('approveCojamURI error', res.err);
  } else if (res.request_key) {
    // request_key 보관
    console.log('approveCojamURI request_key', res.request_key);
    request(res.requestKey, (result) => console.log(result));

    let time = new Date().getTime();
    const endTime = time + 3000;
    while (time < endTime) {
      if( time % 500 === 0 ) {
        await getResult(res.request_key).then((txResult) => {
          console.log('txResult', txResult);

          if(txResult.result?.result) {
            alert('transaction success', txResult.result?.result);
            result.status = txResult.result?.result ? 200 : 400;
          }
        });
      } 

      time = new Date().getTime();
    }
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
              "\"inputs\":" +
                "[" +
                  "{\"name\":\"to\",\"type\":\"address\"}," +
                  "{\"name\":\"amount\",\"type\":\"uint256\"}" +
                "]," +
              "\"name\":\"transfer\"," +
              "\"output\": [{\"name\":\"result\",\"type\":\"bool\"}], " +
              "\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  
  const params = `["${toAddress}",${ caver.utils.toPeb(Number(amount))}]`;
  const result = { spenderAddress: fromAddress, status: 400 };
  const res = await prepare.executeContract({ bappName, from, to, value, abi, params });
  if (res.err) {
    // 에러 처리
    console.log('transfer error', res.err);
  } else if (res.request_key) {
    // request_key 보관
    console.log('transfer request_key', res.request_key);
    request(res.requestKey, (result) => console.log(result));

    let time = new Date().getTime();
    const endTime = time + 3000;
    while (time < endTime) {
      if( time % 500 === 0 ) {
        await getResult(res.request_key).then((txResult) => {
          console.log('txResult', txResult);

          if(txResult.result?.result) {
            alert('transaction success', txResult.result?.result);
            result.status = txResult.result?.result ? 200 : 400;
          }
        });
      } 

      time = new Date().getTime();
    }
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
              "\"output\": [{\"name\":\"result\",\"type\":\"bool\"}], " +
              "\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  
  const params = `["${walletAddress}"]`;
  const result = { spenderAddress: fromAddress, status: 400 };
  const res = await prepare.executeContract({ bappName, from, to, value, abi, params });
  if (res.err) {
    // 에러 처리
    console.log('transferOwnership error', res.err);
  } else if (res.request_key) {
    // request_key 보관
    console.log('transferOwnership request_key', res.request_key);
    request(res.requestKey, (result) => console.log(result));

    let time = new Date().getTime();
    const endTime = time + 3000;
    while (time < endTime) {
      if( time % 500 === 0 ) {
        await getResult(res.request_key).then((txResult) => {
          console.log('txResult', txResult);

          if(txResult.result?.result) {
            alert('transaction success', txResult.result?.result);
            result.status = txResult.result?.result ? 200 : 400;
          }
        });
      } 

      time = new Date().getTime();
    }
  }

  return result;
}