import styled from '@emotion/styled';

export const StyledButton = styled.button`
  text-align: center;
  font-size: 15px;
  font-weight: bold;
  color: #fff;
  padding: 15px;
  background: linear-gradient(114.44deg, #0038f5 0%, #9f03ff 100%);
  border-radius: 8px;
  width: 100%;

  &:disabled {
    background: #939393;
  }
`;
