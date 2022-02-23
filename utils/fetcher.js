import axios from 'axios';
import { API_BASE_URL } from '@config/index';

const Axios = axios.create({
  baseURL: API_BASE_URL, // API URL 샘플
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
 * @dev PUT은 SWR과 쓰지 않아도 상관 없음
 */
export const putDataFetcher = (url, body) => Axios.put(url, body).then((response) => response.data);
/**
 * @dev 전역 데이터 상태 관리할 때 사용하는 fetcher
 */
export const localDataFetcher = (key) => {
  if (sessionStorage.getItem(key) === null) {
    return;
  } else {
    return JSON.parse(sessionStorage.getItem(key));
  }
};
