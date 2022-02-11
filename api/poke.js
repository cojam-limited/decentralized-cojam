import { getDataFetcher } from '../utils/fetcher';
import useSWR from 'swr';

// API URL
const KEY_POKE = 'pokemon?limit=10&offset=10';
// SWR 데이터 키
const POKE_DATA_KEY = 'data/poke';

const pokeFetcher = async () => {
  const res = await getDataFetcher(KEY_POKE);
  if (res && res.results) {
    return res.results;
  }
};

const option = {
  fallbackData: [], // 에러 방지 초기 데이터 삽입
  revalidateOnFocus: false, // 포커스 시에 자동 갱신 비활성화
};

export const usePokeData = () => {
  const { data: pokeData, isValidating: pokeIsValidating, error } = useSWR(POKE_DATA_KEY, pokeFetcher, option);

  return { pokeData, pokeIsValidating, error };
};
