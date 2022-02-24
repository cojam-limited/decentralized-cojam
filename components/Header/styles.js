import styled from '@emotion/styled';

export const StyledHeader = styled.header`
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  box-shadow: 0px 0px 12px -3px rgba(0, 0, 0, 0.3);
  background-color: #fff;
  z-index: 9999;
`;

export const LogoContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  > img {
    width: 45px;
    margin-right: 5px;
  }

  > h1 {
    font-size: 20px;
  }
`;
