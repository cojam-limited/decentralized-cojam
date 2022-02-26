import React, { useState } from 'react';
import { useSWRConfig } from 'swr';
import Button from '@components/Button';
import RandomTray from '@assets/img_tray.png';
import Modal from '@mui/material/Modal';
import CloseIcon from '@components/CloseIcon';
import { ModalWrapper, ModalContents } from '@components/VoteModal/styles';
import { RandomDrawContainer, Step } from './styles';

import toastNotify from '@utils/toast';
import { useWalletData } from '@data/wallet';
import { addMinter } from '@api/UseCaverForOwner';
import { mintWithTokenURI, mintWithKlay } from '@api/UseKaikas';
import { useMenusData } from '@api/menus';
import { useDrawResultData } from '@api/draw';
import { useMintCountData } from '@api/nft';
import { useMintData } from '@api/mintData';
import { getMasterNftMetadataFetcher } from '@api/ipfs';
import { postDataFetcher } from '@utils/fetcher';
import { MINT_CONFIRM_MODAL_DATA_KEY, UPLOAD_IMAGE_MODAL_DATA_KEY, useModalData } from '@data/modal';

function RandomDraw() {
  const [drawingState, setDrawingState] = useState(false);
  const [currentDrawResult, setCurrentDrawResult] = useState({});
  const { walletData } = useWalletData();
  const { menusData } = useMenusData();
  const { drawResultData } = useDrawResultData(walletData?.account);
  const { mintCountData } = useMintCountData(walletData?.account);
  const { mintData } = useMintData(walletData?.account);
  const { modalData, mutateModalData } = useModalData(MINT_CONFIRM_MODAL_DATA_KEY);
  const { mutate } = useSWRConfig();

  const { mutateModalData: mutateImageModalData } = useModalData(UPLOAD_IMAGE_MODAL_DATA_KEY);

  const handleCloseModal = () => {
    mutateModalData({ open: false });
  };

  const getRandomMenuIndex = () => {
    return Math.floor(Math.random() * menusData?.length);
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

  const checkMintData = () => {
    if (!mintData?.metadataUri) {
      toastNotify({
        state: 'warn',
        message: 'Upload Receipt first!',
      });
      return false;
    } else return true;
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
    await postDataFetcher(`draw/result?address=${walletData?.account}&menuNo=${randomMenu.menuNo}`);
  };

  const handleUploadReceipt = async () => {
    try {
      //1.지갑 연동 여부 체크
      if (!checkWalletConnection()) return;

      //2.영수증 업로드 팝업
      mutateImageModalData({ open: true });
      mutate(MasterNftKey);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClickMintNFT = async () => {
    try {
      //1.지갑 연동 여부 체크
      if (!checkWalletConnection()) return;

      //2.DB에 저장된 mintData를 조회
      if (!checkMintData()) return;

      //3.mint 권한을 유저에게 임시로 준다.
      //4-1.하루에 NFT 발급 받은 횟수가 3 미만이면 mintWithTokenURI 호출
      //4-2.하루에 NFT 발급 받은 횟수가 3 이상이면 mintWithKlay 호출
      await addMinter(walletData?.account);
      const masterNftMetadata = await getMasterNftMetadataFetcher(drawResultData?.menuNo);
      await mintWithTokenURI({
        tokenID: mintData.tokenId,
        genralTokenURI: mintData.metadataUri,
        masterTokenURI: masterNftMetadata.metaData,
        menuType: mintData.menuType,
        walletData,
        mintCountData,
        cid: masterNftMetadata.cid,
      });

      /**🔥임시 주석 처리🔥
       if (mintCountData < 3) {
        await addMinter(walletData?.account);

        //mintData를 가져와서 인자로 넘김
        await mintWithTokenURI({
          tokenID: mintData.tokenId,
          genralTokenURI: mintData.metadataUri,
          masterTokenURI: masterMetadataURL,
          menuType: mintData.menuType,
          walletData,
          mintCountData,
        });
      } else {
        //mint confirm 모달 띄우기
        mutateModalData({ open: true }); 
      }
       */
    } catch (error) {
      console.error(error);
    }
  };

  const handleClickMintNFTwithKLAY = async () => {
    try {
      await addMinter(walletData?.account);
      await mintWithKlay({
        tokenID: mintData.tokenId,
        genralTokenURI: mintData.metadataUri,
        masterTokenURI: masterMetadataURL,
        menuType: mintData.menuType,
        walletData,
        mintCountData,
      });
    } catch (error) {
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
          <Button
            text="Upload Receipt"
            disabled={drawResultData?.menuNo ? false : true}
            onClick={handleUploadReceipt}
          />
        </Step>
        <Step>
          <span>Step 3</span>
          <Button text="Get NFT" onClick={handleClickMintNFT} />
        </Step>
      </div>

      <Modal open={Boolean(modalData.open)} onClose={handleCloseModal}>
        <ModalWrapper>
          <ModalContents>
            <h1>The cost will be incurred from the 4th minting.</h1>
            <h1>
              Will you Pay
              <span style={{ color: 'red', margin: '0 5px' }}>0.5 KLAY</span> for minting NFT?
            </h1>

            <CloseIcon handleClose={handleCloseModal} />

            <Button text="Mint" onClick={handleClickMintNFTwithKLAY} />
            <button type="button" className="btn_cancel" onClick={handleCloseModal}>
              Cancel
            </button>
          </ModalContents>
        </ModalWrapper>
      </Modal>
    </RandomDrawContainer>
  );
}

export default RandomDraw;
