import styled from '@emotion/styled';

export const Container = styled.div`
  padding: 20px;
`;
export const UserContainer = styled.div``;

export const AccountCard = styled.div`
  background-color: #f0f0f0;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;

  > h1 {
    font-size: 12px;
    font-weight: normal;
    color: #939393;
    margin-bottom: 5px;
  }
  > .address {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-weight: bold;
    > span {
      margin-right: 5px;
      font-size: 15px;
    }
  }
`;
export const NFTContainer = styled.div`
  > h1 {
    font-size: 20px;
    margin: 20px 0 10px;
  }
`;
