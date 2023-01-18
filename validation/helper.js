import toastNotify from '@utils/toast';
import Caver from 'caver-js';

const caver = new Caver(window.klaytn);
/*
    target let client knows which part makes error
*/
const avoidSpace = (string) => {
    if(!string) return false;
    const result = string.trim().length === 0 ? false : true;
    return result;
}

export const isOverArrayLength = (arr, index, target) => {
    if(arr.length < index) {
        toastNotify({
            state: 'error',
            message: `[${target}] invalid amount : should over ${index}`,
        });
    }
}

export const isOnlySpace = (string, target) => {
    if(!avoidSpace(string)) {
        toastNotify({
            state: 'error',
            message: `[${target}] invalid value : only space`,
        });
    }
}

export const isStringArray = (arr, target) => {
    let result = true;
    for(const value of arr) {
        if(!value || avoidSpace(value))
        result = false;
        break;
    }
    if(!result) {
        toastNotify({
            state: 'error',
            message: `[${target}] invalid value : empty or only space`,
        });
    }
}

export const isValidAddress = (wallet) => {
    if(!caver.utils.isAddress(wallet)) {
        toastNotify({
            state: 'error',
            message: 'invalid wallet address',
        });
    }
}