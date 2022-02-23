import React, { useState } from 'react';
import Button from '@components/Button';
import RandomTray from '@assets/img_tray.png';
import { RandomDrawContainer, Step } from './styles';

import toastNotify from '@utils/toast';
import { useWalletData } from '@data/wallet';
import { addMinter, removeMinter } from '@api/UseCaverForOwner';
import { mintWithTokenURI, mintWithKlay } from '@api/UseKaikas';
import { useMenusData } from '@api/menus';
import { useDrawResultData } from '@api/draw';
import { useMintCountData } from '@api/nft';
import { postDataFetcher } from '@utils/fetcher';

function RandomDraw() {
  const [drawingState, setDrawingState] = useState(false);
  const [currentDrawResult, setCurrentDrawResult] = useState({});
  const { walletData } = useWalletData();
  const { menusData } = useMenusData();
  const { drawResultData } = useDrawResultData(walletData?.account);
  const { mintCountData } = useMintCountData(walletData?.account);

  const getRandomMenuIndex = () => {
    return Math.floor(Math.random() * menusData.length);
  };

  const getDrawResult = () => {
    //뽑기 결과를 이미 사진 업로드해서 인증했는지 여부 출력 => 인증:"TRUE", 인증안함:"FALSE"
    if (drawResultData.verification === 'TRUE') {
      return true;
    }
    return false;
  };

  const checkWalletConnection = () => {
    if (!walletData?.account) {
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
      return true;
    } else return false;
  };

  const handleClickPickRandomly = async () => {
    //1.drawResult 초기화
    setCurrentDrawResult({});
    //2.지갑 연동 여부 체크
    if (!checkWalletConnection()) return;
    //3.인증 여부 체크
    if (checkDrawResultVerification()) return;

    //4.이미지 애니메이션 진행
    setDrawingState(true);
    const DrawPromise = new Promise((resolve, reject) => {
      setTimeout(function () {
        resolve('success');
      }, 1500);
    });
    await DrawPromise;
    setDrawingState(false);

    //5.메뉴 리스트에서 랜덤 index 뽑기
    const randomMenu = menusData[getRandomMenuIndex()];
    setCurrentDrawResult(randomMenu);
    //6.뽑기 결과 index에 해당하는 메뉴이름, 인증여부(false)를 DB에 저장
    await postDataFetcher(`/draw/result?address=${walletData?.account}&menuNo=${randomMenu.menuNo}`);
  };

  const handleUploadReceipt = async () => {
    try {
      console.log('upload');
    } catch (error) {
      console.error(error);
    }
  };

  const handleClickMintNFT = async () => {
    try {
      //1.지갑 연동 여부 체크
      if (!checkWalletConnection()) return;

      //🔥API 연동: 2.DB에 저장된 mintData를 조회

      //4.mint 권한을 유저에게 임시로 준다.
      await addMinter(walletData?.account);
      //5-1.하루에 NFT 발급 받은 횟수가 3 미만이면 mintWithTokenURI 호출
      //5-2.하루에 NFT 발급 받은 횟수가 3 이상이면 mintWithKlay 호출
      if (mintCountData < 3) {
        //mintData를 가져와서 인자로 넘김
        // await mintWithTokenURI(30, 'test_genralTokenURI', 'test_masterTokenURI', 'pizza');
      } else {
        //mintData를 가져와서 인자로 넘김
        //mintWithKlay
      }

      //6.발행이 완료되면 유저의 mint 권한을 제거한다.
      await removeMinter(walletData?.account);

      //🔥API 연동: 7.발행이 완료되면 mintData 초기화

      //🔥API 연동: 8.발행이 완료되면 drawResult 초기화

      //🔥API 연동: 9.발행이 완료되면 mintCountData++
      await postDataFetcher(`/nft/mintCount?address=${walletData?.account}&count=${mintCountData + 1}`);
    } catch (error) {
      removeMinter(walletData?.account);
      console.error(error);
    }
  };

  return (
    <RandomDrawContainer>
      <div className="tray_wrapper ">
        {/**뽑기 결과 출력 */}
        {currentDrawResult?.imageUrl ? (
          <img src={currentDrawResult?.imageUrl || RandomTray} className="img_food" alt={currentDrawResult?.name} />
        ) : (
          <img
            src={RandomTray}
            className={`img_randomtray ${drawingState ? 'rotateAnimation' : ''}`}
            alt="random tray"
          />
        )}
        <h1>{currentDrawResult?.type ? currentDrawResult?.type : 'Pick what you want to eat!'}</h1>
      </div>

      <div className="step_wrapper">
        <Step>
          <span>Step 1</span>
          <Button text="Pick Randomly" onClick={handleClickPickRandomly} />
        </Step>
        <Step>
          <span>Step 2</span>
          <Button text="Upload Receipt" onClick={handleUploadReceipt} />
        </Step>
        <Step>
          <span>Step 3</span>
          <Button text="Get NFT" onClick={handleClickMintNFT} />
        </Step>
      </div>
    </RandomDrawContainer>
  );
}

export default RandomDraw;
