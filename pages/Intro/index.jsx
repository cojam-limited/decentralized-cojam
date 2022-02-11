import React from 'react';
import { useLocalData } from '@utils/fetcher';
import { usePokeData } from '@api/poke';

function Intro() {
  // 전역상태 관리 SWR 샘플
  const KEY_INTRO = 'intro';
  const DATA = { data: 'hi' };
  const { localData, mutateLocalData } = useLocalData(KEY_INTRO, DATA);
  const handleClick = () => {
    mutateLocalData({ data: 'hello' });
  };

  // API 데이터 가져오는 SWR 샘플
  const { pokeData, pokeIsValidating, error } = usePokeData();

  if (pokeIsValidating) {
    return <div>로딩중 ...</div>;
  }

  if (error) {
    return <div>에러 발생!</div>;
  }

  return (
    <div>
      <div>
        <h2>전역 상태 관리</h2>
        <button onClick={handleClick}>Click me! 전역 상태 변경하기</button>
        <h3>data : {localData ? localData.data : 'no data'} </h3>
      </div>

      <br />
      <br />

      <div>
        <h2>API 데이터 상태 관리</h2>
        <ul>
          {pokeData.map((item) => (
            <li key={item.name}>name: {item.name} </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Intro;
