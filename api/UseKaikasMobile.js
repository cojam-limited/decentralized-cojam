import Caver from 'caver-js';
import toastNotify from '@utils/toast';

import axios from 'axios';
import QRCode from 'qrcode';

import { request } from 'klip-sdk';
import isMobile from '@utils/isMobile';

const caver = new Caver(window.klaytn);

// klip은 dev (baobab)가 없음 
const xChainId = process.env.REACT_APP_CHAIN_ID;
const authorization = process.env.REACT_APP_KLIP_AUTH;

const cojamTokenAddress = process.env.REACT_APP_TOKEN_ADDRESS;
const cojamMarketAddress = process.env.REACT_APP_MARKET_ADDRESS;

const klipTimeLimitMs = 60000;

const prepareUrl = "https://api.kaikas.io/api/v1/k/prepare";

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


/* export const getCojamBalance_MOBILE = async (walletAddress) => {
  if(walletAddress) {
    const options = {
      method: 'GET',
      url: `https://kip7-api.klaytnapi.com/v1/contract/${cojamTokenAddress}/account/${walletAddress}/balance`,
      headers: {
          'Content-Type': 'application/json',
          'x-chain-id': `${xChainId}`,
          Authorization: authorization
      }
    };
  
    let result = { balance: 0, status: 400};
    await axios.request(options).then(function (response) {
      result.status = 200;
      result.balance = parseInt(response?.data?.balance, 16);
    }).catch(function (error) {
      console.error(error);
    });

    return result;
  }

  return { status: 400, balance: 0 };
} */

/**
 * Ground Status 변경 Functions 시작
 */
export const draftMarket_MOBILE = async ({
  marketKey,
  creator,
  title,
  creatorFee,
  creatorFeePercentage,
  cojamFeePercentage,
  charityFeePercentage,
}, fromAddress, setQr, setQrModal, setMinutes, setSeconds) => {
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
              "\"outputs\": [], " +
              "\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}"

  const params = `["${marketKey}","${creator}","${title}","${creatorFee}","${creatorFeePercentage}","${cojamFeePercentage}","${charityFeePercentage}"]`;
  const result = { spenderAddress: fromAddress, status: 400 };
  
  await axios.post(prepareUrl,
    {
        bapp: { name: bappName },
        transaction: {
            to: to,
            abi: abi,
            value: value,
            params: params,
        },
        type: "execute_contract",
    }).then(async (response) => {
        const {request_key} = response.data;
        const schema = "kaikas://wallet/browser?url=" + encodeURIComponent("https://google.com/search?q=kaikas");

        // 접속한 환경이 mobile이 아닐 때, Deep Link.
        /* request(request_key, () => toastNotify({
          state: 'error',
          message: '모바일 환경에서 실행해주세요',
        })); */

        // request - web 2 app
        location.href = `kaikas://wallet/api?request_key=${request_key}`;
      
        let time = new Date().getTime();
        const endTime = time + klipTimeLimitMs;
        while (time < endTime) {
          if( time % 500 === 0 ) {
            await axios.get(`https://api.kaikas.io/api/v1/k/result/${request_key}`)
                       .then((response) => {
                          if(response.data.status === "completed") {
                              const status = response.data.result.status;
                              if (status === "success") {
                                result.transactionId = response.data.result.tx_hash;
                                result.status = 200;
                              }

                              setQrModal(false); 
                          } else if(response.data.status === "error") {
                            result.status = 500;
                          }
                        })
                        .catch((error) => {
                          result.status = 500;
                        });
          }

          time = result.status !== 400 ? Number.MAX_SAFE_INTEGER : new Date().getTime();
        }
    }).catch((error) => {
        console.log(error);
    });

  return result;
}

export const approveMarket_MOBILE = async (
  marketKey, fromAddress,
  setQr, setQrModal, setMinutes, setSeconds
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
              "\"outputs\": [], " +
              "\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";

  const params = `["${marketKey}"]`;
  const result = { spenderAddress: fromAddress, status: 400 };
  await axios.post(prepareUrl,
    {
        bapp: { name: bappName },
        transaction: {
            to: to,
            abi: abi,
            value: value,
            params: params,
        },
        type: "execute_contract",
    }).then(async (response) => {
        const {request_key} = response.data;

        // request - web 2 app
        location.href = `kaikas://wallet/api?request_key=${request_key}`;
      
        let time = new Date().getTime();
        const endTime = time + klipTimeLimitMs;
        while (time < endTime) {
          if( time % 500 === 0 ) {
            await axios.get(`https://api.kaikas.io/api/v1/k/result/${request_key}`)
                       .then((response)=> {
                          if(response.data.status === "completed") {
                              const status = response.data.result.status;
                              if (status === "success") {
                                result.transactionId = response.data.result.tx_hash;
                                result.status = 200;
                              }

                              setQrModal(false); 
                          } else if(response.data.status === "error") {
                            result.status = 500;
                          }
                        })
                        .catch((error) => {
                          result.status = 500;
                        });
          }

          time = result.status !== 400 ? Number.MAX_SAFE_INTEGER : new Date().getTime();
        }
    }).catch((error) => {
        console.log(error);
    });

  return result;
}

export const adjournMarket_MOBILE = async (
  marketKey, fromAddress,
  setQr, setQrModal, setMinutes, setSeconds
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
              "\"outputs\": [], " +
              "\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  const params = `["${marketKey}"]`;
  
  const result = { spenderAddress: fromAddress, status: 400 };
  await axios.post(prepareUrl,
    {
        bapp: { name: bappName },
        transaction: {
            to: to,
            abi: abi,
            value: value,
            params: params,
        },
        type: "execute_contract",
    }).then(async (response) => {
        const {request_key} = response.data;

        // request - web 2 app
        location.href = `kaikas://wallet/api?request_key=${request_key}`;
      
        let time = new Date().getTime();
        const endTime = time + klipTimeLimitMs;
        while (time < endTime) {
          if( time % 500 === 0 ) {
            await axios.get(`https://api.kaikas.io/api/v1/k/result/${request_key}`)
                       .then((response)=> {
                          if(response.data.status === "completed") {
                              const status = response.data.result.status;
                              if (status === "success") {
                                result.transactionId = response.data.result.tx_hash;
                                result.status = 200;
                              }

                              setQrModal(false); 
                          } else if(response.data.status === "error") {
                            result.status = 500;
                          }
                        })
                        .catch((error) => {
                          result.status = 500;
                        });
          }

          time = result.status !== 400 ? Number.MAX_SAFE_INTEGER : new Date().getTime();
        }
    }).catch((error) => {
        console.log(error);
    });

  return result;
}

export const finishMarket_MOBILE = async (
  marketKey, fromAddress,
  setQr, setQrModal, setMinutes, setSeconds
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
              "\"outputs\": [], " +
              "\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";

  const params = `["${marketKey}"]`;
  const result = { spenderAddress: fromAddress, status: 400 };
  await axios.post(prepareUrl,
    {
        bapp: { name: bappName },
        transaction: {
            to: to,
            abi: abi,
            value: value,
            params: params,
        },
        type: "execute_contract",
    }).then(async (response) => {
        const {request_key} = response.data;
        // request - web 2 app
        location.href = `kaikas://wallet/api?request_key=${request_key}`;
      
        let time = new Date().getTime();
        const endTime = time + klipTimeLimitMs;
        while (time < endTime) {
          if( time % 500 === 0 ) {
            await axios.get(`https://api.kaikas.io/api/v1/k/result/${request_key}`)
                       .then((response)=> {
                          if(response.data.status === "completed") {
                              const status = response.data.result.status;
                              if (status === "success") {
                                result.transactionId = response.data.result.tx_hash;
                                result.status = 200;
                              }

                              setQrModal(false); 
                          } else if(response.data.status === "error") {
                            result.status = 500;
                          }
                        })
                        .catch((error) => {
                          result.status = 500;
                        });
          }

          time = result.status !== 400 ? Number.MAX_SAFE_INTEGER : new Date().getTime();
        }
    }).catch((error) => {
        console.log(error);
    });

  return result;
}

export const addAnswerKeys_MOBILE = async ({
  marketKey,
  answerKeys 
}, 
fromAddress, setQr, setQrModal, setMinutes, setSeconds
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
              "\"outputs\": [], " +
              "\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";

  const params = `["${marketKey}",${JSON.stringify(answerKeys)}]`;
  const result = { spenderAddress: fromAddress, status: 400 };
  await axios.post(prepareUrl,
    {
        bapp: { name: bappName },
        transaction: {
            to: to,
            abi: abi,
            value: value,
            params: params,
        },
        type: "execute_contract",
    }).then(async (response) => {
        const {request_key} = response.data;
        // request - web 2 app
        location.href = `kaikas://wallet/api?request_key=${request_key}`;
      
        let time = new Date().getTime();
        const endTime = time + klipTimeLimitMs;
        while (time < endTime) {
          if( time % 500 === 0 ) {
            await axios.get(`https://api.kaikas.io/api/v1/k/result/${request_key}`)
                       .then((response)=> {
                          if(response.data.status === "completed") {
                              const status = response.data.result.status;
                              if (status === "success") {
                                result.transactionId = response.data.result.tx_hash;
                                result.status = 200;
                              }

                              setQrModal(false); 
                          } else if(response.data.status === "error") {
                            result.status = 500;
                          }
                        })
                        .catch((error) => {
                          result.status = 500;
                        });
          }

          time = result.status !== 400 ? Number.MAX_SAFE_INTEGER : new Date().getTime();
        }
    }).catch((error) => {
        console.log(error);
    });

  return result;
}


export const retrieveMarket_MOBILE = async (
  questKey, 
  fromAddress,
  setQr, setQrModal, setMinutes, setSeconds
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
              "\"outputs\": [], " +
              "\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";

  const params = `["${questKey}","${questAnswerKey}"]`;
  const result = { spenderAddress: fromAddress, status: 400 };
  await axios.post(prepareUrl,
    {
        bapp: { name: bappName },
        transaction: {
            to: to,
            abi: abi,
            value: value,
            params: params,
        },
        type: "execute_contract",
    }).then(async (response) => {
        const {request_key} = response.data;
        // request - web 2 app
        location.href = `kaikas://wallet/api?request_key=${request_key}`;
      
        let time = new Date().getTime();
        const endTime = time + klipTimeLimitMs;
        while (time < endTime) {
          if( time % 500 === 0 ) {
            await axios.get(`https://api.kaikas.io/api/v1/k/result/${request_key}`)
                       .then((response)=> {
                          if(response.data.status === "completed") {
                              const status = response.data.result.status;
                              if (status === "success") {
                                result.transactionId = response.data.result.tx_hash;
                                result.status = 200;
                              }

                              setQrModal(false); 
                          } else if(response.data.status === "error") {
                            result.status = 500;
                          }
                        })
                        .catch((error) => {
                          result.status = 500;
                        });
          }

          time = result.status !== 400 ? Number.MAX_SAFE_INTEGER : new Date().getTime();
        }
    }).catch((error) => {
        console.log(error);
    });

  return result;
}


export const successMarket_MOBILE = async ({
  questKey,
  questAnswerKey  
},
fromAddress, setQr, setQrModal, setMinutes, setSeconds
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
              "\"outputs\": [], " +
              "\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";

  const params = `["${questKey}","${questAnswerKey}"]`;
  const result = { spenderAddress: fromAddress, status: 400 };
  await axios.post(prepareUrl,
    {
        bapp: { name: bappName },
        transaction: {
            to: to,
            abi: abi,
            value: value,
            params: params,
        },
        type: "execute_contract",
    }).then(async (response) => {
        const {request_key} = response.data;
        // request - web 2 app
        location.href = `kaikas://wallet/api?request_key=${request_key}`;
      
        let time = new Date().getTime();
        const endTime = time + klipTimeLimitMs;
        while (time < endTime) {
          if( time % 500 === 0 ) {
            await axios.get(`https://api.kaikas.io/api/v1/k/result/${request_key}`)
                       .then((response)=> {
                          if(response.data.status === "completed") {
                              const status = response.data.result.status;
                              if (status === "success") {
                                result.transactionId = response.data.result.tx_hash;
                                result.status = 200;
                              }

                              setQrModal(false); 
                          } else if(response.data.status === "error") {
                            result.status = 500;
                          }
                        })
                        .catch((error) => {
                          result.status = 500;
                        });
          }

          time = result.status !== 400 ? Number.MAX_SAFE_INTEGER : new Date().getTime();
        }
    }).catch((error) => {
        console.log(error);
    });

  return result;
}
/**
 * Ground Status 변경 Functions 끝
 */


/**
 * Quest Betting function
 */
export const bettingCojamURI_MOBILE = async ({
  questKey,
  questAnswerKey,
  bettingKey,
  bettingCoinAmount,
}, 
  fromAddress, setQr, setQrModal, setMinutes, setSeconds
) => {
  console.log('kaikas mobile betting!');

  const bappName = 'cojam-v2';
  const to = cojamMarketAddress;
  const value = '0'
  const abi = "{\"inputs\":"+
                "[" +
                  "{\"name\":\"marketKey\",\"type\":\"uint256\"}," +
                  "{\"name\":\"answerKey\",\"type\":\"uint256\"}," +
                  "{\"name\":\"bettingKey\",\"type\":\"uint256\"}," +
                  "{\"name\":\"tokens\",\"type\":\"uint256\"}" +
                "]," +
              "\"name\":\"bet\"," +
              "\"outputs\": [], " +
              "\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";

  const params = `["${questKey}","${questAnswerKey}","${bettingKey}","${caver.utils.toPeb(Number(bettingCoinAmount), 'KLAY')}"]`;
  //const params = `["2022071800000001","3974","${bettingKey}","${caver.utils.toPeb(Number(bettingCoinAmount), 'KLAY')}"]`;

  const result = { spenderAddress: fromAddress, status: 400 };
  await axios.post(prepareUrl,
    {
        bapp: { name: bappName },
        transaction: {
            to: to,
            abi: abi,
            value: value,
            params: params,
        },
        type: "execute_contract",
    }).then(async (response) => {
        const {request_key} = response.data;
        // request - web 2 app
        location.href = `kaikas://wallet/api?request_key=${request_key}`;
      
        let time = new Date().getTime();
        const endTime = time + klipTimeLimitMs;
        while (time < endTime) {
          if( time % 500 === 0 ) {
            await axios.get(`https://api.kaikas.io/api/v1/k/result/${request_key}`)
                       .then((response)=> {
                          if(response.data.status === "completed") {
                              const status = response.data.result.status;
                              if (status === "success") {
                                result.transactionId = response.data.result.tx_hash;
                                result.status = 200;
                              }

                              setQrModal(false); 
                          } else if(response.data.status === "error") {
                            result.transactionId = response.data?.result?.tx_hash;
                            result.status = 500;
                          }
                        })
                        .catch((error) => {
                          result.status = 500;
                        });
          }

          time = result.status !== 400 ? Number.MAX_SAFE_INTEGER : new Date().getTime();
        }
    }).catch((error) => {
        console.log(error);
    });

  return result;
}


/**
 * Quest Betting Approve function
 */
export const approveCojamURI_MOBILE = async (
  bettingCoinAmount, fromAddress,
  setQr, setQrModal, setMinutes, setSeconds
) => { 
  const bappName = 'cojam-v2';
  const txTo = cojamTokenAddress;
  const txAbi = "{\"inputs\":[{\"name\":\"spender\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}]," +
              "\"name\":\"approve\"," +
              "\"outputs\":[]," +
              "\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  const txValue = '0'
  const txParams = `["${cojamMarketAddress}","${caver.utils.toPeb(Number(bettingCoinAmount), 'KLAY')}"]`;

  const result = { spenderAddress: fromAddress, status: 400 };

  try {
    await axios.post(prepareUrl,
    {
        bapp: { name: bappName },
        transaction: {
            to: txTo,
            abi: txAbi,
            value: txValue,
            params: txParams,
        },
        type: "execute_contract",
    }).then(async (response) => {
        const {request_key} = response.data;
        // request - web 2 app
        location.href = `kaikas://wallet/api?request_key=${request_key}`;
        
        let time = new Date().getTime();
        const endTime = time + klipTimeLimitMs;
        while (time < endTime) {
          if( time % 500 === 0 ) {
            await axios.get(`https://api.kaikas.io/api/v1/k/result/${request_key}`)
                       .then((response)=> {
                          if(response.data?.status === "completed") {
                              const status = response.data?.result.status;
                              if (status === "success") {
                                result.transactionId = response.data.result.tx_hash;
                                result.status = 200;
                              }

                              setQrModal(false); 
                          }
                        })
                        .catch((error) => {
                          result.status = 500;
                        });
          }

          time = result.status === 200 ? Number.MAX_SAFE_INTEGER : new Date().getTime();
        }
    }).catch((error) => {
        console.log('approve catch', error);
    });
  } catch(e) {
    log.error(e);
  }

  return result;
}


/**
 * Cojam Token transfer function 
 */
export const transferCojamURI_MOBILE = async ({
  fromAddress, 
  toAddress, 
  amount,
  setQr, setQrModal, setMinutes, setSeconds
}, walletAddress) => {
  const bappName = 'cojam-v2';
  //const from = fromAddress;
  const from = walletAddress;
  const to = cojamTokenAddress;
  const value = '0'
  const abi = "{\"inputs\":" +
                "[" +
                  "{\"name\":\"to\",\"type\":\"address\"}," +
                  "{\"name\":\"amount\",\"type\":\"uint256\"}" +
                "]," +
              "\"name\":\"transfer\"," +
              "\"outputs\": [], " +
              "\"payable\":true,\"stateMutability\":\"payable\",\"type\":\"function\"}";
  
  const params = `["${toAddress}","${caver.utils.toPeb(Number(amount), 'KLAY')}"]`;
  const result = { spenderAddress: fromAddress, status: 400 };
  await axios.post(prepareUrl,
    {
        bapp: { name: bappName },
        transaction: {
            to: to,
            abi: abi,
            value: value,
            params: params,
        },
        type: "execute_contract",
    }).then(async (response) => {
        const {request_key} = response.data;
        // request - web 2 app
        location.href = `kaikas://wallet/api?request_key=${request_key}`;
        
        let time = new Date().getTime();
        const endTime = time + klipTimeLimitMs;
        while (time < endTime) {
          if( time % 500 === 0 ) {
            await axios.get(`https://api.kaikas.io/api/v1/k/result/${request_key}`)
                       .then((response)=> {
                          if(response.data.status === "completed") {
                              const status = response.data.result.status;
                              if (status === "success") {
                                result.transactionId = response.data.result.tx_hash;
                                result.status = 200;
                              }

                              setQrModal(false); 
                          } else if(response.data.status === "error") {
                            result.status = 500;
                          }
                        })
                        .catch((error) => {
                          result.status = 500;
                        });
          }

          time = result.status !== 400 ? Number.MAX_SAFE_INTEGER : new Date().getTime();
        }
    }).catch((error) => {
        console.log(error);
  });

  return result;
}

export const transferOwnership_MOBILE = async (
  walletAddress,
  setQr, setQrModal, setMinutes, setSeconds
) => {
  const bappName = 'cojam-v2';
  const to = cojamMarketAddress;
  const value = '0'
  const abi = "{\"inputs\":"+
                "[" +
                  "{\"name\":\"newOwner\",\"type\":\"address\"}" +
                "]," +
              "\"name\":\"transferOwnership\"," +
              "\"outputs\": [], " +
              "\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";

  const params = `["${walletAddress}"]`;

  const result = { spenderAddress: walletAddress, status: 400 };
  await axios.post(prepareUrl,
    {
        bapp: { name: bappName },
        transaction: {
            to: to,
            abi: abi,
            value: value,
            params: params,
        },
        type: "execute_contract",
    }).then(async (response) => {
        const {request_key} = response.data;
        // request - web 2 app
        location.href = `kaikas://wallet/api?request_key=${request_key}`;
      
        let time = new Date().getTime();
        const endTime = time + klipTimeLimitMs;
        while (time < endTime) {
          if( time % 500 === 0 ) {
            await axios.get(`https://api.kaikas.io/api/v1/k/result/${request_key}`)
                       .then((response)=> {
                          if(response.data.status === "completed") {
                              const status = response.data.result.status;
                              if (status === "success") {
                                result.transactionId = response.data.result.tx_hash;
                                result.status = 200;
                              }

                              setQrModal(false); 
                          } else if(response.data.status === "error") {
                            result.status = 500;
                          }
                        })
                        .catch((error) => {
                          result.status = 500;
                        });
          }

          time = result.status !== 400 ? Number.MAX_SAFE_INTEGER : new Date().getTime();
        }
    }).catch((error) => {
        console.log(error);
    });

  return result;
}

export const receiveToken_MOBILE = async (
  walletData,
  questKey,
  bettingKey,
  setQr, setQrModal, setMinutes, setSeconds
) => {
  const bappName = 'cojam-v2';
  const to = cojamMarketAddress;
  const value = '0'
  const abi = "{\"inputs\":"+
                "[" +
                  "{\"name\":\"marketKey\",\"type\":\"uint256\"}," +
                  "{\"name\":\"bettingKey\",\"type\":\"uint256\"}" +
                "]," +
              "\"name\":\"receiveToken\"," +
              "\"outputs\": [], " +
              "\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";

  const params = `["${questKey}","${bettingKey}"]`;

  const result = { spenderAddress: walletData.account, status: 400 };
  await axios.post(prepareUrl,
    {
        bapp: { name: bappName },
        transaction: {
            to: to,
            abi: abi,
            value: value,
            params: params,
        },
        type: "execute_contract",
    }).then(async (response) => {
        const {request_key} = response.data;
        // request - web 2 app
        location.href = `kaikas://wallet/api?request_key=${request_key}`;
      
        let time = new Date().getTime();
        const endTime = time + klipTimeLimitMs;
        while (time < endTime) {
          if( time % 500 === 0 ) {
            await axios.get(`https://api.kaikas.io/api/v1/k/result/${request_key}`)
                       .then((response)=> {
                          if(response.data.status === "completed") {
                              const status = response.data.result.status;
                              if (status === "success") {
                                result.transactionId = response.data.result.tx_hash;
                                result.status = 200;
                              }

                              setQrModal(false); 
                          } else if(response.data.status === "error") {
                            result.status = 500;
                          }
                        })
                        .catch((error) => {
                          result.status = 500;
                        });
          }

          time = result.status !== 400 ? Number.MAX_SAFE_INTEGER : new Date().getTime();
        }
    }).catch((error) => {
        console.log(error);
    });

  return result;
}