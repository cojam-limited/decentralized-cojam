import { getDataFetcher, postDataFetcher } from '@utils/fetcher';
import useSWR from 'swr';

// API URL
const URL_RESULT = 'draw/result?address=';
const URL_MENU_NUMBER = 'draw/menuNo?address=';
const URL_RESULT_INIT = 'draw/result/init?address=';

// SWR 데이터 키
const DATA_KEY_RESULT = 'data/draw/result';
const DATA_KEY_MENU_NUMBER = 'data/draw/menuNo';

//res.data : { "verification": "FALSE" }
const resultFetcher = async (address) => {
  const res = await getDataFetcher(URL_RESULT + address);
  if (res && res.data) {
    return res.data;
  }
};
//res.data :  {"verification": "FALSE","menuNo": 0}
const menuNumberFetcher = async (address) => {
  const res = await getDataFetcher(URL_MENU_NUMBER + address);
  if (res && res.data) {
    return res.data;
  }
};

const option = {
  fallbackData: {}, // 에러 방지 초기 데이터 삽입
  revalidateOnFocus: false, // 포커스 시에 자동 갱신 비활성화,
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    console.log(key, ':', error.message);
    // 404에서 재시도 안함
    if (error.status === 404) return;
    // 3번까지만 재시도함
    if (retryCount >= 3) return;
    // 3초 후에 재시도
    setTimeout(() => revalidate({ retryCount }), 3000);
  },
};

export const useDrawResultData = (address) => {
  const {
    data: drawResultData,
    isValidating: drawResultDataIsValidating,
    error,
  } = useSWR(address ? DATA_KEY_RESULT : null, () => resultFetcher(address), option);

  return { drawResultData, drawResultDataIsValidating, error };
};

export const useDrawMenuNumberData = (address) => {
  const {
    data: menuNoData,
    isValidating: menuNoDataIsValidating,
    error,
  } = useSWR(address ? DATA_KEY_MENU_NUMBER : null, () => menuNumberFetcher(address), option);

  return { menuNoData, menuNoDataIsValidating, error };
};

//주소에 매핑된 draw result 초기화
export const initDrawResult = (address) => getDataFetcher(`${URL_RESULT_INIT + address}`);
