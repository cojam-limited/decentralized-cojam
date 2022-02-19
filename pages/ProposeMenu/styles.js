import styled from '@emotion/styled';

export const Container = styled.div`
  padding: 20px;
  > h1 {
    font-size: 20px;
    margin-bottom: 10px;
  }
`;

export const UploadContainer = styled.div`
  padding: 20px 0;
  .onlymaster {
    display: flex;
    align-items: center;
    h1 {
      font-size: 15px;
      color: #b20303;
    }
  }
  > input {
    background-color: #f0f0f0;
    border-radius: 8px;
    border: none;
    width: 100%;
    padding: 15px;
    margin: 10px 0;
    font-size: 15px;
  }
`;
