import React, { useState } from 'react';
import Button from '@components/Button';
import RandomTray from '@assets/img_tray.png';
import { RandomDrawContainer, Step } from './styles';
import toastNotify from '@utils/toast';

function RandomDraw() {
  const address = '임시 지갑 주소';
  const [drawingState, setDrawingState] = useState(false);
  const [drawResult, setDrawResult] = useState({});

  const getRandomMenuIndex = () => {
    //🔥API 연동: DB에서 메뉴 리스트 조회
    const menuList = mockMenuList;
    return Math.floor(Math.random() * menuList.length);
  };

  const getDrawResult = () => {
    //🔥API 연동: 뽑기 결과를 이미 사진 업로드해서 인증했는지 여부 출력
    return false;
  };

  const handleClickPickRandomly = async () => {
    //drawResult 초기화
    setDrawResult({});
    //🔥카이카스 연동: 지갑 연동 여부 체크
    if (!address.length) {
      toastNotify({
        state: 'error',
        message: 'Please connect wallet.',
      });
      return;
    }
    //🔥API 연동: 인증 여부 체크
    if (getDrawResult()) {
      toastNotify({
        state: 'warn',
        message: 'Already uploaded Receipt. Please Get NFT first!',
      });
      return;
    }
    setDrawingState(true);
    const DrawPromise = new Promise((resolve, reject) => {
      setTimeout(function () {
        resolve('success');
      }, 1500);
    });
    await DrawPromise;
    setDrawingState(false);

    //🔥API 연동: 메뉴 리스트에서 랜덤 index 뽑기
    setDrawResult(mockMenuList[getRandomMenuIndex()]);
    //🔥API 연동: 뽑기 결과 index에 해당하는 메뉴이름, 인증여부(false)를 DB에 저장
  };
  return (
    <RandomDrawContainer>
      <div className="tray_wrapper ">
        {/**뽑기 결과 출력 */}
        {drawResult?.imageURL ? (
          <img src={drawResult?.imageURL || RandomTray} className="img_food" alt={drawResult?.name} />
        ) : (
          <img
            src={RandomTray}
            className={`img_randomtray ${drawingState ? 'rotateAnimation' : ''}`}
            alt="random tray"
          />
        )}
        <h1>{drawResult?.name ? drawResult?.name : 'Pick what you want to eat!'}</h1>
      </div>

      <div className="step_wrapper">
        <Step>
          <span>Step 1</span>
          <Button text="Pick Randomly" onClick={handleClickPickRandomly} />
        </Step>
        <Step>
          <span>Step 2</span>
          <Button text="Upload Receipt" />
        </Step>
        <Step>
          <span>Step 3</span>
          <Button text="Get NFT" />
        </Step>
      </div>
    </RandomDrawContainer>
  );
}

export default RandomDraw;

//목업메뉴
const mockMenuList = [
  {
    name: 'pizza',
    imageURL:
      'https://images.unsplash.com/photo-1590947132387-155cc02f3212?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
  },
  {
    name: 'burger',
    imageURL:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2799&q=80',
  },
  {
    name: 'salad',
    imageURL:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
  },
  {
    name: 'chicken',
    imageURL:
      'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2940&q=80',
  },
];
