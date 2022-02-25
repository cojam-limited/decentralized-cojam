import React from 'react';
import Modal from '@mui/material/Modal';
import CloseIcon from '@components/CloseIcon';

import { ModalWrapper, ModalContents } from './styles';
import { UPLOAD_IMAGE_MODAL_DATA_KEY, useModalData } from '@data/modal';
import UploadImage from '../UploadImage';

export default function UploadImageModal() {
  const { modalData, mutateModalData } = useModalData(UPLOAD_IMAGE_MODAL_DATA_KEY);
  const handleClose = () => {
    mutateModalData({ open: false });
  };
  return (
    <Modal open={Boolean(modalData.open)} onClose={handleClose}>
      <ModalWrapper>
        <ModalContents>
          <UploadImage />
          <CloseIcon handleClose={handleClose} />
        </ModalContents>
      </ModalWrapper>
    </Modal>
  );
}
