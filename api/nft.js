import { getDataFetcher, postDataFetcher } from '@utils/fetcher';
import useSWR from 'swr';

// API URL
const URL_MINTCOUNT = '/nft/mintCount?address=';
// SWR 데이터 키
const DATA_KEY_MINTCOUNT = 'data/nft/mintCount';

//res : integer
const mintCountFetcher = async (address) => {
  const res = await getDataFetcher(URL_MINTCOUNT + address);
  if (res) {
    return res;
  }
};

const option = {
  fallbackData: 0, // 에러 방지 초기 데이터 삽입
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

export const useMintCountData = (address) => {
  const {
    data: mintCountData,
    isValidating: mintCountDataIsValidating,
    error,
  } = useSWR(address ? DATA_KEY_MINTCOUNT : null, () => mintCountFetcher(address), option);

  return { mintCountData, mintCountDataIsValidating, error };
};

export const updateMintCount = (address, countData) =>
  putDataFetcher(`nft/mintCount?address=${address}&count=${countData + 1}`);
