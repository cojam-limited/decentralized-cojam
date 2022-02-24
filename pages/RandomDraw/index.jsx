import React, { useState } from 'react';
import Button from '@components/Button';
import RandomTray from '@assets/img_tray.png';
import { RandomDrawContainer, Step } from './styles';
import toastNotify from '@utils/toast';

function RandomDraw() {
  const [drawingState, setDrawingState] = useState(false);
  const [currentDrawResult, setCurrentDrawResult] = useState({});

  const getRandomMenuIndex = () => {
    //🔥API 연동: DB에서 메뉴 리스트 조회
    const menuList = mockMenuList;
    return Math.floor(Math.random() * menuList.length);
  };

  const getDrawResult = () => {
    //🔥API 연동: 뽑기 결과를 이미 사진 업로드해서 인증했는지 여부 출력
    return false;
  };

  const checkWalletConnection = () => {
    if (!address.length) {
      toastNotify({
        state: 'error',
        message: 'Please connect wallet.',
      });
      return false;
    } else return true;
  };

  const checkDrawResultVerification = () => {
    if (getDrawResult()) {
      toastNotify({
        state: 'warn',
        message: 'Already uploaded Receipt. Please Get NFT first!',
      });
      return false;
    } else return true;
  };

  const handleClickPickRandomly = async () => {
    //drawResult 초기화
    setCurrentDrawResult({});
    //🔥지갑 연동: 지갑 연동 여부 체크
    if (!checkWalletConnection()) return;
    //🔥API 연동: 인증 여부 체크
    if (!checkDrawResultVerification()) return;

    setDrawingState(true);
    const DrawPromise = new Promise((resolve, reject) => {
      setTimeout(function () {
        resolve('success');
      }, 1500);
    });
    await DrawPromise;
    setDrawingState(false);

    //🔥API 연동: 메뉴 리스트에서 랜덤 index 뽑기
    setCurrentDrawResult(mockMenuList[getRandomMenuIndex()]);
    //🔥API 연동: 뽑기 결과 index에 해당하는 메뉴이름, 인증여부(false)를 DB에 저장
  };

  const handleClickMintNFT = () => {
    //🔥지갑 연동: 지갑 연동 여부 체크
    if (!checkWalletConnection()) return;

    //🔥API 연동: DB에 저장된 mintData를 조회

    //🔥API 연동: 하루에 NFT 발급 받은 횟수를 조회

    //하루에 NFT 발급 받은 횟수가 3 미만이면 mintWithTokenURI 호출

    //하루에 NFT 발급 받은 횟수가 3 이상이면 mintWithKlay 호출

    //🔥API 연동: mintData 초기화

    //🔥API 연동: drawResult 초기화
  };

  return (
    <RandomDrawContainer>
      <div className="tray_wrapper ">
        {/**뽑기 결과 출력 */}
        {currentDrawResult?.imageURL ? (
          <img src={currentDrawResult?.imageURL || RandomTray} className="img_food" alt={currentDrawResult?.name} />
        ) : (
          <img
            src={RandomTray}
            className={`img_randomtray ${drawingState ? 'rotateAnimation' : ''}`}
            alt="random tray"
          />
        )}
        <h1>{currentDrawResult?.name ? currentDrawResult?.name : 'Pick what you want to eat!'}</h1>
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
