import useSWR from 'swr';
import { localDataFetcher } from '@utils/fetcher';

// SWR 데이터 키
export const WALLET_DATA_KEY = 'data/wallet';

const option = {
  fallbackData: {}, // 에러 방지 초기 데이터 삽입
  revalidateOnFocus: false, // 포커스 시에 자동 갱신 비활성화
};

export const useWalletData = () => {
  const { data: walletData, mutate } = useSWR(WALLET_DATA_KEY, localDataFetcher, option);

  // 전역으로 데이터 갱신
  const mutateWalletData = (data) => {
    mutate(async (prevData) => {
      let nextData;

      if (!prevData) {
        if (sessionStorage.getItem(WALLET_DATA_KEY) === null) {
          prevData = {};
        } else {
          prevData = JSON.parse(sessionStorage.getItem(WALLET_DATA_KEY));
        }
      }

      // 이전데이터와 변경데이터를 결합하여 다음 데이터 생성
      nextData = { ...Object.assign(prevData, data) };
      sessionStorage.setItem(WALLET_DATA_KEY, JSON.stringify(nextData));

      return nextData;
    });
  };

  return { walletData, mutateWalletData };
};
