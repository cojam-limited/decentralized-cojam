import { getDataFetcher, putDataFetcher } from '@utils/fetcher';
import useSWR from 'swr';

// API URL
const URL_GET = 'ipfs/getMasterNftMetadata?menu_no=';
const URL_PUT = 'ipfs/setMintedMasterNft?cid=';
// SWR 데이터 키
export const DATA_KEY = 'data/ipfs/MasterNFTmetadataURL';

/*
"data": {
  "cid": "QmWqq6JPYBtky3DCnprRFDmgknVM4TqW6SFKxif4M5LrC3",
  "metaData": "https://metadata-store.klaytnapi.com/77718fb9-7531-420c-e42a-f60ae0d95cda/18994115-b19d-677d-7e19-13071bac8440.json"
}
*/
export const getMasterNftMetadataFetcher = async (menu_no) => {
  const res = await getDataFetcher(URL_GET + menu_no);
  if (res && res.data) {
    return res.data;
  }
};

export const setMintedMasterNftFetcher = async (cid) => {
  const res = await putDataFetcher(URL_PUT + cid);
  if (res && res.data) {
    return res.data;
  }
};

const option = {
  fallbackData: '', // 에러 방지 초기 데이터 삽입
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
    error,
  } = useSWR(menu_no >= 0 ? DATA_KEY : null, () => masterMetadataURLFetcher(menu_no), option);

  return { masterMetadataURL, masterMetadataURLIsValidating, error };
};
