import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import CloseIcon from '@mui/icons-material/Close';
import { ModalWrapper, ModalContents, QRCodeContainer } from './styles';
import Logo_Klip from '@assets/logo_klip.svg';
import Logo_Kaikas from '@assets/logo_kaikas.svg';
import QRCode from 'qrcode.react';
import { KLIP_MODAL_DATA_KEY, useModalData } from '@data/modal';

export default function KlipQRModal() {
  const { modalData, mutateModalData } = useModalData(KLIP_MODAL_DATA_KEY);

  const handleClose = () => {
    mutateModalData({ open: false });
  };
  return (
    <Modal open={Boolean(modalData.open)} onClose={handleClose}>
      <ModalWrapper>
        <ModalContents>
          <h1>
            <img src={Logo_Klip} alt="klip" />
            Connect Klip via Kakao
          </h1>
          <CloseIcon
            onClick={handleClose}
            sx={{
              position: 'fixed',
              top: '25px',
              right: '30px',
            }}
          />
          <QRCodeContainer>
            <QRCode value={''} size={150} style={{ margin: 'auto' }} />
            <h2>Scan QR code with camera app or KakaoTalk code scan</h2>
          </QRCodeContainer>
        </ModalContents>
      </ModalWrapper>
    </Modal>
  );
}
