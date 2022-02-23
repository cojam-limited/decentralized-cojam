import { getDataFetcher } from '@utils/fetcher';
import useSWR from 'swr';

// API URL
const URL_RESULT = 'draw/result?address=';
// SWR 데이터 키
const DATA_KEY_RESULT = 'data/draw/result';

//res.data : { "verification": "FALSE" }
const resultFetcher = async (address) => {
  const res = await getDataFetcher(URL_RESULT + address);
  if (res && res.data) {
    return res.data;
  }
};

const option = {
  fallbackData: {}, // 에러 방지 초기 데이터 삽입
  revalidateOnFocus: false, // 포커스 시에 자동 갱신 비활성화
};

export const useDrawResultData = (address) => {
  const {
    data: drawResultData,
    isValidating: drawResultDataIsValidating,
    error,
  } = useSWR(address ? DATA_KEY_RESULT : null, () => resultFetcher(address), option);

  return { drawResultData, drawResultDataIsValidating, error };
};
