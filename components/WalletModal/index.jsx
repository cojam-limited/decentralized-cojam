import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import CloseIcon from '@mui/icons-material/Close';
import { ModalWrapper, ModalContents, ConnectKlipButton, ConnectKaikasButton } from './styles';
import Logo_Klip from '@assets/logo_klip.svg';
import Logo_Kaikas from '@assets/logo_kaikas.svg';

import { KLIP_MODAL_DATA_KEY, WALLET_MODAL_DATA_KEY, useModalData } from '@data/modal';

export default function WalletModal() {
  const { modalData, mutateModalData } = useModalData(WALLET_MODAL_DATA_KEY);
  const { mutateModalData: mutateKlipModalData } = useModalData(KLIP_MODAL_DATA_KEY);

  const handleClose = () => {
    mutateModalData({ open: false });
  };

  const handleOpenKlipModal = () => {
    mutateKlipModalData({ open: true });
  };

  console.log(modalData);
  return (
    <Modal open={Boolean(modalData.open)} onClose={handleClose}>
      <ModalWrapper>
        <ModalContents>
          <h1>Connect Wallet</h1>
          <CloseIcon
            onClick={handleClose}
            sx={{
              position: 'fixed',
              top: '25px',
              right: '30px',
            }}
          />
          <ConnectKlipButton onClick={handleOpenKlipModal}>
            <img src={Logo_Klip} style={{ marginRight: '5px' }} alt="connect Klip" />
            <span>Connect Klip via Kakao</span>
          </ConnectKlipButton>
          <ConnectKaikasButton>
            <img src={Logo_Kaikas} style={{ marginRight: '5px' }} alt="connect Kaikas" />
            <span>Kaikas by Klaytn</span>
          </ConnectKaikasButton>
        </ModalContents>
      </ModalWrapper>
    </Modal>
  );
}
