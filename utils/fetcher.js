import axios from 'axios';
import { API_BASE_URL } from '@config/index';

export const Axios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

/**
 * @dev 서버 API 연동할 때 사용하는 fetcher
 */
export const getDataFetcher = async (url) => {
  const res = await Axios.get(url).catch(function (error) {
    if (error.response && error.response.status > 400) {
      // 요청이 이루어졌으며 400이상 에러를 처리
      const requestError = new Error('An error occurred.');
      // 에러 객체에 부가 정보를 추가합니다.
      requestError.status = error.response.status;
      requestError.message = error.response.data.message;
      throw requestError;
    } else if (error.request) {
      // 요청이 이루어 졌으나 응답을 받지 못함
      console.log(error.request);
    } else {
      // 오류를 발생시킨 요청을 설정하는 중에 문제가 발생
      console.log('Error', error.message);
    }
  });

  return res?.data;
};
/**
 * @dev POST는 SWR과 쓰지 않아도 상관 없음
 */
export const postDataFetcher = async (url, body) => {
  const res = await Axios.post(url, body).catch(function (error) {
    if (error.response && error.response.status > 400) {
      // 요청이 이루어졌으며 400이상 에러를 처리
      const requestError = new Error('An error occurred.');
      // 에러 객체에 부가 정보를 추가합니다.
      requestError.status = error.response.status;
      requestError.message = error.response.data.message;
      throw requestError;
    } else if (error.request) {
      // 요청이 이루어 졌으나 응답을 받지 못함
      console.log(error.request);
    } else {
      // 오류를 발생시킨 요청을 설정하는 중에 문제가 발생
      console.log('Error', error.message);
    }
  });

  return res?.data;
};
/**
 * @dev PUT은 SWR과 쓰지 않아도 상관 없음
 */
export const putDataFetcher = async (url, body) => {
  const res = await Axios.put(url, body).catch(function (error) {
    if (error.response && error.response.status > 400) {
      // 요청이 이루어졌으며 400이상 에러를 처리
      const requestError = new Error('An error occurred.');
      // 에러 객체에 부가 정보를 추가합니다.
      requestError.status = error.response.status;
      requestError.message = error.response.data.message;
      throw requestError;
    } else if (error.request) {
      // 요청이 이루어 졌으나 응답을 받지 못함
      console.log(error.request);
    } else {
      // 오류를 발생시킨 요청을 설정하는 중에 문제가 발생
      console.log('Error', error.message);
    }
  });

  return res?.data;
};
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
