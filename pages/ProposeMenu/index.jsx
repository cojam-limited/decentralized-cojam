import React, { useRef } from 'react';
import AlertIcon from '@mui/icons-material/ErrorOutlineOutlined';
import Button from '@components/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

import { Container, UploadContainer } from './styles';

function ProposeMenu() {
  const inputRef = useRef();

  return (
    <Container>
      <h1>Current Proposed List</h1>
      <List
        sx={{
          height: '200px',
          overflowY: 'scroll',
        }}
      >
        {proposedList.map((item, index) => (
          <ListItem key={index + item} sx={{ backgroundColor: '#F0F0F0', borderRadius: '5px', margin: '5px 0' }}>
            {item}
          </ListItem>
        ))}
      </List>

      <UploadContainer>
        <div className="onlymaster">
          <AlertIcon color="warning" />
          <h1> Only Master NFT Owner</h1>
        </div>
        <input type="text" ref={inputRef} placeholder="enter what you want to eat" />
        <Button text="Upload your Menu"></Button>
      </UploadContainer>
    </Container>
  );
}

export default ProposeMenu;

const proposedList = [
  'blabla',
  'blabla',
  'blabla',
  'blabla',
  'blabla',
  'blabla',
  'blabla',
  'blabla',
  'blabla',
  'blabla',
  'blabla',
  'blabla',
];
