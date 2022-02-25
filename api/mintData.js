import { getDataFetcher } from '@utils/fetcher';
import useSWR from 'swr';

// API URL
const URL = 'mintData?address=';
const URL_INIT = 'mintData/init?address=';
// SWR 데이터 키
const DATA_KEY = 'data/mintData';

//res : { address: "string", metadataUri: "string", tokenId: 0 }
const mintDataFetcher = async (address) => {
  const res = await getDataFetcher(URL + address);
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

export const useMintData = (address) => {
  const {
    data: mintData,
    isValidating: mintDataIsValidating,
    error,
  } = useSWR(address ? DATA_KEY : null, () => mintDataFetcher(address), option);

  return { mintData, mintDataIsValidating, error };
};

//주소에 매핑된 mint data 초기화
export const initMintData = (address) => getDataFetcher(`${URL_INIT + address}`);
