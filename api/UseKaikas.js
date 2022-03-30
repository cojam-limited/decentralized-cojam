import Caver from 'caver-js';
import CaverExtKAS from 'caver-js-ext-kas';
import toastNotify from '@utils/toast';

const caver = new Caver(window.klaytn);
const caverExt = new CaverExtKAS('1001', 'KASKPNC0ZKWPYJVJEUFCQ696', 'RQCcF0L5HJP9WNt3BMOMyb7r59DGdKdK6qRIHG21');

const cojamTokenAddress = '0x7f223b1607171b81ebd68d22f1ca79157fd4a44b';   // contract address
const cojamMarketAddress = '0x864804674770a531b1cd0CC66DF8e5b12Ba84A09';  // KAS address
const approveFuncAbi = caver.klay.abi.encodeFunctionSignature({
  name: 'approve',
  type: 'function',
  inputs: [{
    type: 'address',
    name: 'spender'
  },{
    type: 'uint256',
    name: 'amount'
  },
  ]
});

const abiJson = {
  name: 'approve',
  type: 'function',
  inputs: [{
    type: 'address',
    name: 'spender'
  },{
    type: 'uint256',
    name: 'amount'
  }]
};

const abiJson2 = [{
  name: 'approve',
  type: 'function',
  inputs: [{
    type: 'address',
    name: 'spender'
  },{
    type: 'uint256',
    name: 'amount'
  }]
}];

//const CojamContract = new caver.contract(abiJson2, cojamTokenAddress);

export const kaikasLogin = async () => {
  try {
    console.log('login', window.klaytn, (typeof window.klaytn !== 'undefined'));

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

export const lockKaikas = async () => {
  console.log('lock kaikas', caver.klay.personal, window.klaytn.selectedAddress);

  if( window.klaytn.selectedAddress ) {
    caver.klay.personal.lockAccount( klaytn.selectedAddress );
  }
}

export const bettingCojamURI = async ({
  questKey,
  questAnswerKey,
  bettingKey,
  bettingCoinAmount
}) => {
  const betContractABI = [{
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

  const betContractAddress = cojamMarketAddress;
  const betContract = new caver.klay.Contract(betContractABI, betContractAddress)

  let result = { spenderAddress: cojamMarketAddress };
  await betContract.methods.bet(
    questKey, questAnswerKey, bettingKey, caver.utils.toPeb(Number(bettingCoinAmount), 'KLAY')
  ).send({from: klaytn.selectedAddress, gas: '9000000'},
    function(error, transactionHash) {
      console.log('bet result', error, transactionHash);
      result.transactionId = transactionHash;
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

  const contractAddress = cojamTokenAddress;
  const myContract = new caver.klay.Contract(contractABI, contractAddress)

  let result = { spenderAddress: cojamTokenAddress };
  await myContract.methods.approve(
    cojamMarketAddress, caver.utils.toPeb(Number(bettingCoinAmount), 'KLAY')
  ).send({from: klaytn.selectedAddress, gas: '9000000'},
    function(error, transactionHash) {
      console.log('approve result', error, transactionHash);
      result.transactionId = transactionHash;
    });

  return result;  
}

/*
  await caver.klay
      .sendTransaction({
        type: 'SMART_CONTRACT_EXECUTION',
        from: window.klaytn.selectedAddress,
        to: cojamTokenAddress,
        data: encodedData,
        value: '0x00',
        gas: 9000000, //🔥estimatedGas보다 실제 gas가 더 많이 드는 이슈 발생해서 우선 더 높은 값을 주는 것으로 세팅
      })
      .on('transactionHash', (hash) => {
        console.log(`transactionHash ${hash}`);
      })
      .on('receipt', (receipt) => {
        console.log('successs', receipt);
      })
      .on('error', (error) => {
        console.log(error);
      });
      */

  //console.log(result);

/*
  const encodeResult = caver.klay.abi.encodeFunctionCall(abiJson, [cojamTokenAddress, 0]);
  const tx = {
    from: window.klaytn.selectedAddress,
    to: cojamTokenAddress,
    value: 0,
    input: encodeResult,
    gas: 9000000,
    feeRatio: 99,
    submit: true
  }

  console.log(window.klaytn);

  console.log('caver', caver);
  console.log('caverExt', caverExt);
  const result = await caverExt.kas.wallet.requestSmartContractExecution(tx);

  console.log('contract result', result);
  */

  //const contractAbi = CojamContract.methods.approve();

  /*
  const encodeResult = caver.klay.abi.encodeFunctionCall(abiJson, [cojamTokenAddress, 0]);
  console.log('encodeResult', encodeResult);

  console.log('selected address', window.klaytn.selectedAddress);

  const resultData = CojamContract.methods.approve(cojamTokenAddress, 0)
                                           .call({
                                            type: 'SMART_CONTRACT_EXECUTION',
                                            from: window.klaytn.selectedAddress,
                                            to: cojamTokenAddress,
                                            data: encodeResult,
                                            value: '0x00',
                                            gas: 9000000,
                                           });
  console.log('resultData', resultData);
  */
  


  // POINT
  /*
  const data = caver.klay.abi.encodeFunctionCall(
    {
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
    },
    [cojamMarketAddress, caver.utils.toPeb(amount, 'KLAY')]
  )
  
  await caver.klay.sendTransaction({
    type: 'SMART_CONTRACT_EXECUTION',
    from: klaytn.selectedAddress,
    to: cojamTokenAddress,
    gas: '9000000',
    data
  });
  */
