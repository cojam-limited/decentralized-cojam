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

export const proposedListItemStyles = {
  backgroundColor: '#F0F0F0',
  borderRadius: '5px',
  margin: '5px 0',
  '&:hover': { backgroundColor: '#4b209b', color: '#fff', cursor: 'pointer' },
};
export const noListStyles = { backgroundColor: '#fcc7c7', padding: '10px', borderRadius: '5px' };
