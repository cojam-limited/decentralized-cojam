import styled from '@emotion/styled';

export const RandomDrawContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: calc(100% - 60px);

  .tray_wrapper {
    padding: 20px 0;
    text-align: center;
    .img_randomtray {
      width: 85%;
      max-width: 500px;
    }
    h1 {
      font-size: 20px;
      margin: 20px;
    }
  }

  .step_wrapper {
    width: 100%;
  }
`;

export const Step = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
  width: 100%;

  > span {
    font-size: 12px;
    text-align: center;
    border: 1px solid #7e0dfd;
    border-radius: 6px;
    color: #7e0dfd;
    padding: 5px 0;
    width: 55px;
    margin-right: 8px;
  }
`;
