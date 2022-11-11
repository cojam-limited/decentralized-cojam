import { getCojamBalance, draftMarket, addAnswerKeys, approveMarket, adjournMarket, retrieveMarket, successMarket, finishMarket } from "@api/UseKaikas";
import { getCojamBalance_KLIP, draftMarket_KLIP, addAnswerKeys_KLIP, approveMarket_KLIP, adjournMarket_KLIP, retrieveMarket_KLIP, successMarket_KLIP, finishMarket_KLIP } from "@api/UseKlip";
import { draftMarket_MOBILE, addAnswerKeys_MOBILE, approveMarket_MOBILE, adjournMarket_MOBILE, retrieveMarket_MOBILE, successMarket_MOBILE, finishMarket_MOBILE } from "@api/UseKaikasMobile";

import { approveCojamURI, bettingCojamURI, receiveToken, transferOwnership, transferCojamURI, owner } from "./UseKaikas";
import { approveCojamURI_KLIP, bettingCojamURI_KLIP, receiveToken_KLIP, transferCojamURI_KLIP, transferOwnership_KLIP } from "./UseKlip";
import { approveCojamURI_MOBILE, bettingCojamURI_MOBILE, receiveToken_MOBILE, transferCojamURI_MOBILE, transferOwnership_MOBILE } from "./UseKaikasMobile";

import isMobile from '@utils/isMobile';

  export const checkLogin = async (walletData) => {    
    
    if(!walletData || Object.keys(walletData).length === 0) {
      return true;
    }

    // kaikas or klip
    if (typeof window.klaytn !== 'undefined' && walletData?.type === 'kaikas') {
      const accounts = await window.klaytn.enable();

      if(accounts && accounts[0]) {
        return true;
      } else {
        return false;
      }
    } else {
      return walletData.account;
    }
  }

  export const callGetCojamBalance = async ( 
    walletData 
  ) => {
    let newBalance = 0;

    alert('get cojambalance');
    alert(walletData?.type);

    if(walletData?.type === 'kaikas') {
      newBalance = await getCojamBalance(walletData?.account);

      alert('new balance');
      alert(newBalance);
    } else {
      const cojamBalance = await getCojamBalance_KLIP(walletData?.account);
      newBalance = cojamBalance?.balance ?? 0;
    }

    return newBalance / 10 ** 18;
  }

  export const callTransferOwnership = async (
      walletData,
      targetAddress,
      setQr, setQrModal, setMinutes, setSeconds
    ) => {
        let result;
        if(walletData?.type === 'kaikas') {
          if(isMobile()) {
            await transferOwnership_MOBILE(targetAddress, setQr, setQrModal, setMinutes, setSeconds).then(res => result = res);
          } else {
            await transferOwnership(targetAddress).then(res => result = res);
          }
            
        } else {
            await transferOwnership_KLIP(targetAddress, setQr, setQrModal, setMinutes, setSeconds).then(res => result = res);
        }
    
        return result;
    }
  
  /**
   * Ground Status 변경 Functions 시작
   */
  export const callDraftMarket = async (
      params, 
      walletData,
      setQr, setQrModal, setMinutes, setSeconds
  ) => {
    let result;
    if(walletData?.type === 'kaikas') {
      if(isMobile()) {
        await draftMarket_MOBILE(params, walletData?.account, setQr, setQrModal, setMinutes, setSeconds).then(res => result = res);
      } else {
        await draftMarket(params).then(res => result = res);
      }
    } else {
        await draftMarket_KLIP(params, walletData?.account, setQr, setQrModal, setMinutes, setSeconds).then(res => result = res);
    }

    return result;
  }


  
  export const callApproveMarket = async (
    marketKey, 
    walletData,
    setQr, setQrModal, setMinutes, setSeconds
  ) => {
    let result;
    if(walletData?.type === 'kaikas') {
      if(isMobile()) {
        await approveMarket_MOBILE(marketKey, walletData?.account, setQr, setQrModal, setMinutes, setSeconds).then(res => result = res);
      } else {
        await approveMarket(marketKey).then(res => result = res);
      }
        
    } else {
        await approveMarket_KLIP(marketKey, walletData?.account, setQr, setQrModal, setMinutes, setSeconds).then(res => result = res);
    }

    return result;
  }
  
  export const callAdjournMarket = async (
    marketKey, 
    walletData,
    setQr, setQrModal, setMinutes, setSeconds
  ) => {
    let result;
    if(walletData?.type === 'kaikas') {
      if(isMobile()) {
        await adjournMarket_MOBILE(marketKey, walletData?.account, setQr, setQrModal, setMinutes, setSeconds).then(res => result = res);
      } else {
        await adjournMarket(marketKey).then(res => result = res);
      }
    } else {
        await adjournMarket_KLIP(marketKey, walletData?.account, setQr, setQrModal, setMinutes, setSeconds).then(res => result = res);
    }

    return result;
  }
  
  export const callFinishMarket = async (
    marketKey, 
    walletData,
    setQr, setQrModal, setMinutes, setSeconds
  ) => {
    let result;
    if(walletData?.type === 'kaikas') {
      if(isMobile()) {
        await finishMarket(marketKey).then(res => result = res);
      } else {
        await finishMarket_MOBILE(marketKey, walletData?.account, setQr, setQrModal, setMinutes, setSeconds).then(res => result = res);
      }
    } else {
        await finishMarket_KLIP(marketKey, walletData?.account, setQr, setQrModal, setMinutes, setSeconds).then(res => result = res);
    }

    return result;
  }

  export const getOwner = async () => {
    await owner().then(res => result = res);
    
  } 
  
  export const callAddAnswerKeys = async (
      params, 
      walletData,
      setQr, setQrModal, setMinutes, setSeconds
  ) => {
    let result;
    if(walletData?.type === 'kaikas') {
      if(isMobile()) {
        await addAnswerKeys_MOBILE(params, walletData?.account, setQr, setQrModal, setMinutes, setSeconds).then(res => result = res); 
      } else {
        await addAnswerKeys(params).then(res => result = res);
      }
    } else {
        await addAnswerKeys_KLIP(params, walletData?.account, setQr, setQrModal, setMinutes, setSeconds).then(res => result = res);
    }

    return result;
  }
  
  
  export const callRetrieveMarket = async (
    questKey, 
    walletData,
    setQr, setQrModal, setMinutes, setSeconds
  ) => {
    let result;
    if(walletData?.type === 'kaikas') {
      if(isMobile()) {
        await retrieveMarket_MOBILE(questKey, walletData?.account, setQr, setQrModal, setMinutes, setSeconds).then(res => result = res);
      } else {
        await retrieveMarket(questKey).then(res => result = res);
      }
    } else {
        await retrieveMarket_KLIP(questKey, walletData?.account, setQr, setQrModal, setMinutes, setSeconds).then(res => result = res);
    }

    return result;
  }
  
  
  export const callSuccessMarket = async (
      params,
      walletData,
      setQr, setQrModal, setMinutes, setSeconds
  ) => {
    let result;
    if(walletData?.type === 'kaikas') {
      if(isMobile()) {
        await successMarket_MOBILE(params, walletData?.account, setQr, setQrModal, setMinutes, setSeconds).then(res => result = res);
      } else {
        await successMarket(params).then(res => result = res);
      }
    } else {
        await successMarket_KLIP(params, walletData?.account, setQr, setQrModal, setMinutes, setSeconds).then(res => result = res);
    }

    return result;
  }
  /**
   * Ground Status 변경 Functions 끝
   */
  
  /**
   * Quest Betting function
   */
  export const callBettingCojamURI = async (
      params,
      walletData,
      setQr, setQrModal, setMinutes, setSeconds
  ) => {
    let result;
    if(walletData?.type === 'kaikas') {
      if(isMobile()) {
        await bettingCojamURI_MOBILE(
          params, 
          walletData?.account, 
          setQr, setQrModal, setMinutes, setSeconds
        ).then(res => result = res);
      } else {
        await bettingCojamURI(params).then(res => result = res);
      }
    } else {
        await bettingCojamURI_KLIP(
          params, 
          walletData?.account, 
          setQr, setQrModal, setMinutes, setSeconds
        ).then(res => result = res);
    }

    return result;
  }
  
  
  /**
   * Quest Betting Approve function
   */
  export const callApproveCojamURI = async (
    bettingCoinAmount, 
    walletData,
    setQr, setQrModal, setMinutes, setSeconds
  ) => { 
    let result;
    if(walletData?.type === 'kaikas') {
      if(isMobile()) {
        await approveCojamURI_MOBILE(
          bettingCoinAmount, 
          walletData?.account,
          setQr, setQrModal, setMinutes, setSeconds
        ).then(res => result = res);
      } else {
        await approveCojamURI(bettingCoinAmount).then(res => result = res);
      }
    } else {
        await approveCojamURI_KLIP(
          bettingCoinAmount, 
          walletData?.account,
          setQr, setQrModal, setMinutes, setSeconds
        ).then(res => result = res);
    }

    return result;
  }
  
  /**
   * Cojam Token transfer function 
   */
  export const callTransferCojamURI = async (
      params,
      walletData,
      setQr, setQrModal, setMinutes, setSeconds
  ) => {
    let result;
    if(walletData?.type === 'kaikas') {
      if(isMobile()) {
        await transferCojamURI_MOBILE(params, walletData?.account, setQr, setQrModal, setMinutes, setSeconds).then(res => result = res);
      } else {
        await transferCojamURI(params).then(res => result = res);
      }
    } else {
        await transferCojamURI_KLIP(params, walletData?.account, setQr, setQrModal, setMinutes, setSeconds).then(res => result = res);
    }

    return result;
  }

  export const callReceiveToken = async (
    walletData, questKey, bettingKey, setQr, setQrModal, setMinutes, setSeconds
  ) => {
    let result;
    if(walletData?.type === 'kaikas') {
      if(isMobile()) {
        await receiveToken_MOBILE(walletData, questKey, bettingKey, setQr, setQrModal, setMinutes, setSeconds).then(res => result = res);
      } else {
        await receiveToken(questKey, bettingKey).then(res => result = res);
      }
    } else {
      await receiveToken_KLIP(walletData, questKey, bettingKey, setQr, setQrModal, setMinutes, setSeconds).then(res => result = res);
    }

    return result;
  }