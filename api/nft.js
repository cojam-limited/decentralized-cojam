import { getDataFetcher } from '@utils/fetcher';
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
  revalidateOnFocus: false, // 포커스 시에 자동 갱신 비활성화
};

export const useMintCountData = (address) => {
  const {
    data: mintCountData,
    isValidating: mintCountDataIsValidating,
    error,
  } = useSWR(address ? DATA_KEY_MINTCOUNT : null, () => mintCountFetcher(address), option);

  return { mintCountData, mintCountDataIsValidating, error };
};
