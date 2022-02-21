import React from 'react';
import Button from '@components/Button';
import RandomTray from '@assets/img_tray.png';
import { RandomDrawContainer, Step } from './styles';
import { addMinter, removeMinter } from '@api/UseCaver';
import { mintWithTokenURI } from '@api/UseKaikas';
import { useWalletData } from '@data/wallet';

function RandomDraw() {
  const { walletData } = useWalletData();

  //테스트용
  const mint = () => {
    mintWithTokenURI(13, 'test', 'test2', 'pizza');
  };
  const addBadgemealMinter = () => {
    addMinter(walletData?.account);
  };
  const removeBadgemealMinter = () => {
    removeMinter(walletData?.account);
  };

  const handleClickGetNFT = async () => {
    /** GetNFT 플로우
      1. 지갑 연동 여부를 체크한다.
      2. 지갑이 연동되어 있으면 DB에 저장된 mintData를 조회한다.
      3. mintData가 있으면 DB에 저장된 하루에 NFT 발급 받은 횟수를 조회한다.
      4. Owner가 addMinter(유저지갑주소) 호출해서 mint 권한을 유저에게 임시로 준다.
      5-1. 하루에 NFT 발급 받은 횟수가 3 미만이면 mintWithTokenURI,
      5-2. 하루에 NFT 발급 받은 횟수가 3 이상이면 mintWithKlay를 호출한다.
      6. 발행이 완료되면 Owner는 renounceMinter(유저지갑주소)를 호출해서 유저의 mint 권한을 제거한다.
      7. 발행이 완료되면 지갑주소와 매핑된 mintData, drawResult를 초기화한다.
    */
  };
  return (
    <RandomDrawContainer>
      <div className="tray_wrapper">
        <img src={RandomTray} className="img_randomtray" alt="random tray" />
        <h1>Pick what you want to eat!</h1>
      </div>

      <div className="step_wrapper">
        <Step>
          <span>Step 1</span>
          <Button text="Pick Randomly"></Button>
        </Step>
        <Step>
          <span>Step 2</span>
          <Button text="Upload Receipt"></Button>
        </Step>
        <Step>
          <span>Step 3</span>
          <Button text="Get NFT"></Button>
        </Step>
      </div>
    </RandomDrawContainer>
  );
}

export default RandomDraw;
