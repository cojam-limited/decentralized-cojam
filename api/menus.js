import { getDataFetcher } from '@utils/fetcher';
import useSWR from 'swr';

// API URL
const URL = 'menus';
// SWR 데이터 키
const DATA_KEY = 'data/menus';

//res : [{menuNo: 0, type: '김치찌개', imageUrl: 'sample.com'}]
const menusFetcher = async () => {
  const res = await getDataFetcher(URL);
  if (res) {
    return res;
  }
};

const option = {
  fallbackData: [], // 에러 방지 초기 데이터 삽입
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

export const useMenusData = () => {
  const { data: menusData, isValidating: menusIsValidating, error } = useSWR(DATA_KEY, menusFetcher, option);

  return { menusData, menusIsValidating, error };
};
