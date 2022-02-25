import React from 'react';
import Modal from '@mui/material/Modal';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@components/Button';

import { ModalWrapper, ModalContents, QRCodeContainer } from './styles';
import { VOTE_MODAL_DATA_KEY, useModalData } from '@data/modal';

export default function VoteModal() {
  const { modalData, mutateModalData } = useModalData(VOTE_MODAL_DATA_KEY);

  const handleClose = () => {
    mutateModalData({ open: false, menu: '' });
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
          <Button text="Vote" />
          <button type="button" className="btn_cancel" onClick={handleClose}>
            Cancel
          </button>
        </ModalContents>
      </ModalWrapper>
    </Modal>
  );
}
