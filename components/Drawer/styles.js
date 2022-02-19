import styled from '@emotion/styled';

export const DrawerContents = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
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
export const ServiceContainer = styled.ul`
  li {
    font-size: 15px;
    padding: 5px 10px;
  }

  li:hover {
    background-color: #f0f0f0;
    border-radius: 6px;
    cursor: pointer;
  }
`;
