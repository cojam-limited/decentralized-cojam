import { getDataFetcher } from '@utils/fetcher';
import useSWR from 'swr';

// API URL
const URL = 'https://tostit.i234.me:5005/ipfs/getMasterNftMetadata?menu_no=';
// SWR 데이터 키
const DATA_KEY = 'data/ipfs/MasterNFTmetadataURL';

//res : { address: "string", metadataUri: "string", tokenId: 0 }
const masterMetadataURLFetcher = async (menu_no) => {
  const res = await getDataFetcher(URL + menu_no);
  if (res && res.data) {
    return res.data.result;
  }
};

const option = {
  fallbackData: {}, // 에러 방지 초기 데이터 삽입
  revalidateOnFocus: false, // 포커스 시에 자동 갱신 비활성화
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

export const useMasterMetadataURLData = (menu_no) => {
  const {
    data: masterMetadataURL,
    isValidating: masterMetadataURLIsValidating,
    mutate: mutateMasterMetadata,
    error,
  } = useSWR(menu_no >= 0 ? DATA_KEY : null, () => masterMetadataURLFetcher(menu_no), option);

  return { masterMetadataURL, masterMetadataURLIsValidating, error, mutateMasterMetadata };
};
