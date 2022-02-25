import styled from '@emotion/styled';

export const Container = styled.div`
  padding: 20px;
  > h1 {
    font-size: 20px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
  }

  > h2 {
    color: #b20303;
  }
`;

export const proposedListItemStyles = {
  backgroundColor: '#F0F0F0',
  borderRadius: '5px',
  margin: '5px 0',
  '&:hover': { backgroundColor: '#4b209b', color: '#fff', cursor: 'pointer' },
};
export const winnerListItemStyles = { backgroundColor: '#F0F0F0', borderRadius: '5px', margin: '5px 0' };
export const noListStyles = { backgroundColor: '#fcc7c7', padding: '10px', borderRadius: '5px' };
