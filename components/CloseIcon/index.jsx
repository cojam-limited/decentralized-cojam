import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

function CloseIconButton({ handleClose }) {
  return (
    <CloseIcon
      onClick={handleClose}
      sx={{
        position: 'fixed',
        top: '25px',
        right: '30px',
        ':hover': {
          cursor: 'pointer',
        },
      }}
    />
  );
}

export default CloseIconButton;
