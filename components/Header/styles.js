import styled from '@emotion/styled';

export const StyledHeader = styled.header`
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
`;

export const LogoContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  > img {
    width: 50px;
    margin-right: 5px;
  }

  > h1 {
    font-size: 25px;
  }
`;
