import React, { useState } from 'react';
import { useSWRConfig } from 'swr';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import Button from '@components/Button';
import { Container, BoxUpload, ImagePreview, DeleteFileButton } from './styles';

import { Axios } from '@utils/fetcher';
import toastNotify from '@utils/toast';
import { useWalletData } from '@data/wallet';
import { UPLOAD_IMAGE_MODAL_DATA_KEY, useModalData } from '@data/modal';
import { DATA_KEY as mintDataKey } from '@api/mintData';
import { useDrawMenuNumberData } from '@api/draw';

function UploadImage() {
  const [image, setImage] = useState('');
  const [content, setContent] = useState('');
  const [isUploaded, setIsUploaded] = useState(false);
  const { walletData } = useWalletData();
  const { menuNoData } = useDrawMenuNumberData(walletData?.account);
  const { mutateModalData: mutateImageModalData } = useModalData(UPLOAD_IMAGE_MODAL_DATA_KEY);

  const { mutate } = useSWRConfig();

  function handleImageChange(e) {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        setImage(e.target.result);
        setIsUploaded(true);
      };
      reader.readAsDataURL(e.target.files[0]);
      setContent(e.target.files[0]);
    }
  }

  const initFileImage = () => {
    setIsUploaded('');
    setImage('');
    setContent('');
  };

  const handleClickSubmit = async (e) => {
    try {
      e.preventDefault();
      const formData = new FormData();
      formData.append('address', walletData.account);
      formData.append('image', content);
      formData.append('menuNo', menuNoData?.menuNo);

      const res = await Axios.post('verify/receipt', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      /** response
       * //인증 로직까지 전부 정상적으로 실행되었을때는 인증이 되거나 안되었을 때 둘다 status가 "SUCCESS"로 떨어지고 verification: "FALSE" 나 "TRUE" 로 구분
       * //중간에 API실패나 NULL에러떴을땐 400이상 에러로 떨어지거나 status: "FAILED"
       res: {data: {verification: "FALSE"}
        status: "SUCCESS" }
       */

      if (res.data.status === 'SUCCESS') {
        if (res.data.data.verification === 'FALSE') {
          initFileImage();
          toastNotify({
            state: 'error',
            message: 'The verification failed.',
          });
        } else {
          mutateImageModalData({ open: false });
          toastNotify({
            state: 'success',
            message: 'The receipt has been verified.',
          });
          mutate(mintDataKey);
        }
      } else {
        toastNotify({
          state: 'error',
          message: 'An error occurred.',
        });
      }

      console.log(res);
    } catch (error) {
      mutateImageModalData({ open: false });
      toastNotify({
        state: 'error',
        message: 'An error occurred.',
      });
      console.error(error);
    }
  };

  return (
    <Container>
      <h2>Upload your Receipt image file</h2>
      <BoxUpload>
        <div className="image-upload">
          {!isUploaded ? (
            <>
              <label htmlFor="upload-input">
                <CreateNewFolderIcon fontSize="large" />
                <p>Click to upload</p>
              </label>

              <input id="upload-input" type="file" accept=".jpg,.jpeg,.gif,.png" onChange={handleImageChange} />
            </>
          ) : (
            <ImagePreview>
              <img id="uploaded-image" src={image} draggable={false} alt="uploaded-img" />
            </ImagePreview>
          )}
        </div>
      </BoxUpload>

      <Button text="Upload" onClick={handleClickSubmit}></Button>
      <DeleteFileButton onClick={initFileImage}>Delete File</DeleteFileButton>
    </Container>
  );
}

export default UploadImage;
