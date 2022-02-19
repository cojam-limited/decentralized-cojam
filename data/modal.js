import useSWR from 'swr';
import { localDataFetcher } from '@utils/fetcher';

// SWR 데이터 키
export const WALLET_MODAL_DATA_KEY = 'data/modal-wallet';
export const KLIP_MODAL_DATA_KEY = 'data/modal-klip';
export const VOTE_MODAL_DATA_KEY = 'data/modal-vote';

const option = {
  fallbackData: {}, // 에러 방지 초기 데이터 삽입
  revalidateOnFocus: false, // 포커스 시에 자동 갱신 비활성화
};

export const useModalData = (MODAL_DATA_KEY) => {
  const { data: modalData, mutate } = useSWR(MODAL_DATA_KEY, localDataFetcher, option);

  // 전역으로 데이터 갱신
  const mutateModalData = (data) => {
    mutate(async (prevData) => {
      let nextData;

      if (!prevData) {
        if (sessionStorage.getItem(MODAL_DATA_KEY) === null) {
          prevData = {};
        } else {
          prevData = JSON.parse(sessionStorage.getItem(MODAL_DATA_KEY));
        }
      }

      // 이전데이터와 변경데이터를 결합하여 다음 데이터 생성
      nextData = { ...Object.assign(prevData, data) };
      sessionStorage.setItem(MODAL_DATA_KEY, JSON.stringify(nextData));

      return nextData;
    });
  };

  return { modalData, mutateModalData };
};
