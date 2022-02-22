import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@components/Button';

import { ModalWrapper, ModalContents } from './styles';
import { VOTE_MODAL_DATA_KEY, useModalData } from '@data/modal';
import { useWalletData } from '@data/wallet';
import { vote, isBadgemealNFTholder } from '@api/UseKaikas';
import toastNotify from '@utils/toast';

export default function VoteModal() {
  const { modalData, mutateModalData } = useModalData(VOTE_MODAL_DATA_KEY);
  const { walletData } = useWalletData();

  const checkWalletConnection = () => {
    if (!walletData?.account) {
      toastNotify({
        state: 'error',
        message: 'Please connect wallet.',
      });
      return false;
    } else return true;
  };

  const handleClose = () => {
    mutateModalData({ open: false, menu: '', menuIndex: '' });
  };

  const handleClickVote = async () => {
    try {
      /**
      1. 지갑연동 체크
      2. NFT 소유자가 아닐 경우 토스트메세지로 에러를 보여준다.
      3. 소유자라면 메뉴 추가 함수를 실행한다.
      */
      if (!checkWalletConnection()) return;

      const isNFTHolder = await isBadgemealNFTholder();
      if (!isNFTHolder) {
        toastNotify({
          state: 'error',
          message: 'You have no right to vote.',
        });
        return;
      } else {
        await vote(Number(modalData.menuIndex));
        mutateModalData({ open: false, menu: '', menuIndex: '' });
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Modal open={Boolean(modalData.open)} onClose={handleClose}>
      <ModalWrapper>
        <ModalContents>
          <h1>Do you really want to vote for {modalData.menu}?</h1>
          <CloseIcon
            onClick={handleClose}
            sx={{
              position: 'fixed',
              top: '25px',
              right: '30px',
            }}
          />
          <Button text="Vote" onClick={handleClickVote} />
          <button type="button" className="btn_cancel" onClick={handleClose}>
            Cancel
          </button>
        </ModalContents>
      </ModalWrapper>
    </Modal>
  );
}
