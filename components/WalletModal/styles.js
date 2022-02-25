import styled from '@emotion/styled';

export const ModalWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 400px;
  padding: 10px;
`;

export const ModalContents = styled.div`
  background-color: #fff;
  padding: 20px;

  > h1 {
    font-size: 18px;
    margin-bottom: 25px;
  }
`;

export const ConnectKlipButton = styled.button`
  color: #171b1d;
  background-color: #fed400;
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  text-align: center;
  border-radius: 6px;
  margin: 10px 0;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
`;
export const ConnectKaikasButton = styled.button`
  color: #fff;
  background-color: #665a49;
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  text-align: center;
  border-radius: 6px;
  margin: 10px 0;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
`;
