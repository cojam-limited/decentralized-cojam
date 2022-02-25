import styled from '@emotion/styled';

export const ModalWrapper = styled.div`
  background-color: #fed400;
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

  > h1 {
    display: flex;
    align-items: center;
    font-size: 15px;
    margin-bottom: 30px;

    > img {
      margin-right: 5px;
    }
  }
`;

export const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  > h2 {
    font-size: 12px;
    font-weight: normal;
    margin-top: 25px;
  }
`;
