import Caver from 'caver-js';
import toastNotify from '@utils/toast';

import axios from 'axios';
import QRCode from 'qrcode';

import { request } from 'klip-sdk';
import isMobile from '@utils/isMobile';

const caver = new Caver(window.klaytn);

const xChainId = '8217'; // prod

const authorization = 'Basic S0FTSzFQTzJSR1RZNU5LTjJERktDVVhMOkFpd1NDeUN3Z2Q4Wkc5aUtqWXNXS3ZBam96UXZRN3BwRjhCLWZqcWU='; // prod

// klip은 dev (baobab)가 없음 
const cojamTokenAddress = '0x7f223b1607171b81ebd68d22f1ca79157fd4a44b';  // prod
const cojamMarketAddress = '0x2078466926E4Af541DC47d954C487517bcE49c28'; // prod

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
      console.log('balance', response);

      result.status = 200;
      result.balance = parseInt(response?.data?.balance, 16);
    }).catch(function (error) {
      console.error(error);
    });

    return result;
  }

  return { status: 400, balance: 0 };
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
  await axios.post("https://a2a-api.klipwallet.com/v2/a2a/prepare",
    {
        bapp: { name: bappName},
        transaction: {
            to: to,
            abi: abi,
            value: value,
            params: params,
        },
        type: "execute_contract",
    }).then(async (response) => {
        const {request_key} = response.data;
        const qrUrl = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;

        if( !isMobile() ) {
          setMinutes(5); 
          setSeconds(0);

          setQr(await QRCode.toDataURL(qrUrl));
          setQrModal(true); 
        } else {
          // 접속한 환경이 mobile이 아닐 때, Deep Link.
          request(request_key, () => toastNotify({
            state: 'error',
            message: '모바일 환경에서 실행해주세요',
          }));
        }
      
        let time = new Date().getTime();
        const endTime = time + 60000;
        while (time < endTime) {
          if( time % 500 === 0 ) {
            await axios.get(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`)
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
                        });
          }

          time = result.status !== 400 ? Number.MAX_SAFE_INTEGER : new Date().getTime();
        }
    }).catch((error) => {
        console.log(error);
    });

  return result;
}

export const approveMarket_KLIP = async (
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
  await axios.post("https://a2a-api.klipwallet.com/v2/a2a/prepare",
    {
        bapp: { name: bappName},
        transaction: {
            to: to,
            abi: abi,
            value: value,
            params: params,
        },
        type: "execute_contract",
    }).then(async (response) => {
        const {request_key} = response.data;
        const qrUrl = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;

        if( !isMobile() ) {
          setMinutes(5); 
          setSeconds(0);

          setQr(await QRCode.toDataURL(qrUrl));
          setQrModal(true); 
        } else {
          // 접속한 환경이 mobile이 아닐 때, Deep Link.
          request(request_key, () => toastNotify({
            state: 'error',
            message: '모바일 환경에서 실행해주세요',
          }));
        }
      
        let time = new Date().getTime();
        const endTime = time + 60000;
        while (time < endTime) {
          if( time % 500 === 0 ) {
            await axios.get(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`)
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
                        });
          }

          time = result.status !== 400 ? Number.MAX_SAFE_INTEGER : new Date().getTime();
        }
    }).catch((error) => {
        console.log(error);
    });

  return result;
}

export const adjournMarket_KLIP = async (
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
  await axios.post("https://a2a-api.klipwallet.com/v2/a2a/prepare",
    {
        bapp: { name: bappName},
        transaction: {
            to: to,
            abi: abi,
            value: value,
            params: params,
        },
        type: "execute_contract",
    }).then(async (response) => {
        const {request_key} = response.data;
        const qrUrl = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;

        if( !isMobile() ) {
          setMinutes(5); 
          setSeconds(0);

          setQr(await QRCode.toDataURL(qrUrl));
          setQrModal(true); 
        } else {
          // 접속한 환경이 mobile이 아닐 때, Deep Link.
          request(request_key, () => toastNotify({
            state: 'error',
            message: '모바일 환경에서 실행해주세요',
          }));
        }
      
        let time = new Date().getTime();
        const endTime = time + 60000;
        while (time < endTime) {
          if( time % 500 === 0 ) {
            await axios.get(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`)
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
                        });
          }

          time = result.status !== 400 ? Number.MAX_SAFE_INTEGER : new Date().getTime();
        }
    }).catch((error) => {
        console.log(error);
    });

  return result;
}

export const finishMarket_KLIP = async (
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
  await axios.post("https://a2a-api.klipwallet.com/v2/a2a/prepare",
    {
        bapp: { name: bappName},
        transaction: {
            to: to,
            abi: abi,
            value: value,
            params: params,
        },
        type: "execute_contract",
    }).then(async (response) => {
        const {request_key} = response.data;
        const qrUrl = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;

        if( !isMobile() ) {
          setMinutes(5); 
          setSeconds(0);

          setQr(await QRCode.toDataURL(qrUrl));
          setQrModal(true); 
        } else {
          // 접속한 환경이 mobile이 아닐 때, Deep Link.
          request(request_key, () => toastNotify({
            state: 'error',
            message: '모바일 환경에서 실행해주세요',
          }));
        }
      
        let time = new Date().getTime();
        const endTime = time + 60000;
        while (time < endTime) {
          if( time % 500 === 0 ) {
            await axios.get(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`)
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
                        });
          }

          time = result.status !== 400 ? Number.MAX_SAFE_INTEGER : new Date().getTime();
        }
    }).catch((error) => {
        console.log(error);
    });

  return result;
}

export const addAnswerKeys_KLIP = async ({
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

  const params = `["${marketKey}","${answerKeys}"]`;
  const result = { spenderAddress: fromAddress, status: 400 };
  await axios.post("https://a2a-api.klipwallet.com/v2/a2a/prepare",
    {
        bapp: { name: bappName},
        transaction: {
            to: to,
            abi: abi,
            value: value,
            params: params,
        },
        type: "execute_contract",
    }).then(async (response) => {
        const {request_key} = response.data;
        const qrUrl = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;

        if( !isMobile() ) {
          setMinutes(5); 
          setSeconds(0);

          setQr(await QRCode.toDataURL(qrUrl));
          setQrModal(true); 
        } else {
          // 접속한 환경이 mobile이 아닐 때, Deep Link.
          request(request_key, () => toastNotify({
            state: 'error',
            message: '모바일 환경에서 실행해주세요',
          }));
        }
      
        let time = new Date().getTime();
        const endTime = time + 60000;
        while (time < endTime) {
          if( time % 500 === 0 ) {
            await axios.get(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`)
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
                        });
          }

          time = result.status !== 400 ? Number.MAX_SAFE_INTEGER : new Date().getTime();
        }
    }).catch((error) => {
        console.log(error);
    });

  return result;
}


export const retrieveMarket_KLIP = async (
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
  await axios.post("https://a2a-api.klipwallet.com/v2/a2a/prepare",
    {
        bapp: { name: bappName},
        transaction: {
            to: to,
            abi: abi,
            value: value,
            params: params,
        },
        type: "execute_contract",
    }).then(async (response) => {
        const {request_key} = response.data;
        const qrUrl = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;

        if( !isMobile() ) {
          setMinutes(5); 
          setSeconds(0);

          setQr(await QRCode.toDataURL(qrUrl));
          setQrModal(true); 
        } else {
          // 접속한 환경이 mobile이 아닐 때, Deep Link.
          request(request_key, () => toastNotify({
            state: 'error',
            message: '모바일 환경에서 실행해주세요',
          }));
        }
      
        let time = new Date().getTime();
        const endTime = time + 60000;
        while (time < endTime) {
          if( time % 500 === 0 ) {
            await axios.get(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`)
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
                        });
          }

          time = result.status !== 400 ? Number.MAX_SAFE_INTEGER : new Date().getTime();
        }
    }).catch((error) => {
        console.log(error);
    });

  return result;
}


export const successMarket_KLIP = async ({
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
  await axios.post("https://a2a-api.klipwallet.com/v2/a2a/prepare",
    {
        bapp: { name: bappName},
        transaction: {
            to: to,
            abi: abi,
            value: value,
            params: params,
        },
        type: "execute_contract",
    }).then(async (response) => {
        const {request_key} = response.data;
        const qrUrl = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;

        if( !isMobile() ) {
          setMinutes(5); 
          setSeconds(0);

          setQr(await QRCode.toDataURL(qrUrl));
          setQrModal(true); 
        } else {
          // 접속한 환경이 mobile이 아닐 때, Deep Link.
          request(request_key, () => toastNotify({
            state: 'error',
            message: '모바일 환경에서 실행해주세요',
          }));
        }
      
        let time = new Date().getTime();
        const endTime = time + 60000;
        while (time < endTime) {
          if( time % 500 === 0 ) {
            await axios.get(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`)
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
export const bettingCojamURI_KLIP = async ({
  questKey,
  questAnswerKey,
  bettingKey,
  bettingCoinAmount,
}, 
  fromAddress, setQr, setQrModal, setMinutes, setSeconds
) => {
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
  await axios.post("https://a2a-api.klipwallet.com/v2/a2a/prepare",
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
        const qrUrl = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;

        if( !isMobile() ) {
          setMinutes(5); 
          setSeconds(0);

          setQr(await QRCode.toDataURL(qrUrl));
          setQrModal(true); 
        } else {
          // 접속한 환경이 mobile이 아닐 때, Deep Link.
          request(request_key, () => toastNotify({
            state: 'error',
            message: '모바일 환경에서 실행해주세요',
          }));
        }
      
        let time = new Date().getTime();
        const endTime = time + 60000;
        while (time < endTime) {
          if( time % 500 === 0 ) {
            await axios.get(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`)
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
export const approveCojamURI_KLIP = async (
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
  await axios.post("https://a2a-api.klipwallet.com/v2/a2a/prepare",
    {
        bapp: { name: bappName},
        transaction: {
            to: txTo,
            abi: txAbi,
            value: txValue,
            params: txParams,
        },
        type: "execute_contract",
    }).then(async (response) => {
        const {request_key} = response.data;
        const qrUrl = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;

        if( !isMobile() ) {
          setMinutes(5); 
          setSeconds(0);

          setQr(await QRCode.toDataURL(qrUrl));
          setQrModal(true); 
        } else {
          // 접속한 환경이 mobile이 아닐 때, Deep Link.
          request(request_key, () => toastNotify({
            state: 'error',
            message: '모바일 환경에서 실행해주세요',
          }));
        }
        
        let time = new Date().getTime();
        const endTime = time + 60000;
        while (time < endTime) {
          if( time % 500 === 0 ) {
            await axios.get(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`)
                       .then((response)=> {
                          if(response.data?.status === "completed") {
                              const status = response.data?.result.status;
                              if (status === "success") {
                                result.transactionId = response.data.result.tx_hash;
                                result.status = 200;
                              }

                              setQrModal(false); 
                          }
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
export const transferCojamURI_KLIP = async ({
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
  const abi = "{\"constant\":false, " + 
              "\"inputs\":" +
                "[" +
                  "{\"name\":\"to\",\"type\":\"address\"}," +
                  "{\"name\":\"amount\",\"type\":\"uint256\"}" +
                "]," +
              "\"name\":\"transfer\"," +
              "\"outputs\": [], " +
              "\"payable\":true,\"stateMutability\":\"payable\",\"type\":\"function\"}";
  
  const params = `["${toAddress}","${caver.utils.toPeb(Number(amount), 'KLAY')}"]`;
  const result = { spenderAddress: fromAddress, status: 400 };
  await axios.post("https://a2a-api.klipwallet.com/v2/a2a/prepare",
    {
        bapp: { name: bappName},
        transaction: {
            to: to,
            abi: abi,
            value: value,
            params: params,
        },
        type: "execute_contract",
    }).then(async (response) => {
        const {request_key} = response.data;
        const qrUrl = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;

        if( !isMobile() ) {
          setMinutes(5); 
          setSeconds(0);

          setQr(await QRCode.toDataURL(qrUrl));
          setQrModal(true); 
        } else {
          // 접속한 환경이 mobile이 아닐 때, Deep Link.
          request(request_key, () => toastNotify({
            state: 'error',
            message: '모바일 환경에서 실행해주세요',
          }));
        }
        
        let time = new Date().getTime();
        const endTime = time + 60000;
        while (time < endTime) {
          if( time % 500 === 0 ) {
            await axios.get(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`)
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
                        });
          }

          time = result.status !== 400 ? Number.MAX_SAFE_INTEGER : new Date().getTime();
        }
    }).catch((error) => {
        console.log(error);
  });

  return result;
}

export const transferOwnership_KLIP = async (
  walletData,
  setQr, setQrModal, setMinutes, setSeconds
) => {
  const walletAddress = walletData?.account;
  const bappName = 'cojam-v2';
  const to = cojamTokenAddress;
  const value = '0'
  const abi = "{\"constant\":false, " + 
              "\"inputs\":"+
                "[" +
                  "{\"name\":\"newOwner\",\"type\":\"address\"}" +
                "]," +
              "\"name\":\"transferOwnership\"," +
              "\"outputs\": [], " +
              "\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}";
  
  const params = `["${walletAddress}"]`;

  const result = { spenderAddress: walletAddress, status: 400 };
  await axios.post("https://a2a-api.klipwallet.com/v2/a2a/prepare",
    {
        bapp: { name: bappName},
        transaction: {
            to: to,
            abi: abi,
            value: value,
            params: params,
        },
        type: "execute_contract",
    }).then(async (response) => {
        const {request_key} = response.data;
        const qrUrl = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;

        if( !isMobile() ) {
          setMinutes(5); 
          setSeconds(0);

          setQr(await QRCode.toDataURL(qrUrl));
          setQrModal(true); 
        } else {
          // 접속한 환경이 mobile이 아닐 때, Deep Link.
          request(request_key, () => toastNotify({
            state: 'error',
            message: '모바일 환경에서 실행해주세요',
          }));
        }
        
        let time = new Date().getTime();
        const endTime = time + 60000;
        while (time < endTime) {
          if( time % 500 === 0 ) {
            await axios.get(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`)
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
                        });
          }

          time = result.status !== 400 ? Number.MAX_SAFE_INTEGER : new Date().getTime();
        }
    }).catch((error) => {
        console.log(error);
  });

  return result;
}