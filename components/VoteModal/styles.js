import styled from '@emotion/styled';

export const ModalWrapper = styled.div`
  background-color: transparent;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 400px;
  padding: 10px;
`;

export const ModalContents = styled.div`
  padding: 20px;
  background-color: #fff;

  > h1 {
    display: flex;
    align-items: center;
    font-size: 15px;
    margin-bottom: 30px;
  }

  .onlyNFTholder {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    h2 {
      font-size: 13px;
      color: #b20303;
    }
  }

  .btn_cancel {
    text-align: center;
    font-size: 15px;
    font-weight: bold;
    color: #000;
    padding: 15px;
    border: 1px solid #000;
    border-radius: 8px;
    width: 100%;
    margin-top: 10px;
  }
`;
