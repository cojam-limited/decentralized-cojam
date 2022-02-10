import axios from 'axios';
import useSWR from 'swr';

const Axios = axios.create({
  baseURL: 'https://pokeapi.co/api/v2/', // API URL 샘플
  timeout: 10000,
});

/**
 * @dev 서버 API 연동할 때 사용하는 fetcher
 */
export const getDataFetcher = (url) => Axios.get(url).then((response) => response.data);
/**
 * @dev POST는 SWR과 쓰지 않아도 상관 없음
 */
export const postDataFetcher = (url, body) => Axios.post(url, body).then((response) => response.data);
/**
 * @dev 전역 데이터 상태 관리할 때 사용하는 fetcher
 */
export const localDataFetcher = (key, initalData) => {
  if (sessionStorage.getItem(key) === null) {
    return { ...initalData };
  } else {
    return JSON.parse(sessionStorage.getItem(key));
  }
};

export const useLocalData = (key, initalData) => {
  const { data: localData, mutate, error } = useSWR(key, () => localDataFetcher(key, initalData));

  const mutateLocalData = (data) => {
    mutate(async (prevData) => {
      let nextData;

      if (!prevData) {
        if (sessionStorage.getItem(key) === null) {
          prevData = { ...initalData };
        } else {
          prevData = JSON.parse(sessionStorage.getItem(key));
        }
      }

      // 이전데이터와 변경데이터를 결합하여 다음 데이터 생성
      nextData = { ...Object.assign(prevData, data) };
      sessionStorage.setItem(key, JSON.stringify(nextData));

      return nextData;
    });
  };

  return { localData, mutateLocalData, error };
};
