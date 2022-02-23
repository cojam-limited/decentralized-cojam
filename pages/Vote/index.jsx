import React, { useRef, useState } from 'react';
import AlertIcon from '@mui/icons-material/ErrorOutlineOutlined';
import Button from '@components/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListAltIcon from '@mui/icons-material/ListAlt';
import FoodBankIcon from '@mui/icons-material/FoodBankOutlined';
import { Container, proposedListItemStyles, lastWinnerListItemStyles } from './styles';
import { VOTE_MODAL_DATA_KEY, useModalData } from '@data/modal';

function Vote() {
  const { mutateModalData } = useModalData(VOTE_MODAL_DATA_KEY);
  const [userNftList, setUserNftList] = useState([]);
  const handleOpenVoteModal = (menu) => () => {
    mutateModalData({ open: true, menu });
  };
  return (
    <Container>
      <h1>
        <ListAltIcon />
        Current Proposed List
      </h1>
      <h2>Choose only one below</h2>
      <List
        sx={{
          height: '200px',
          overflowY: 'scroll',
          marginBottom: '30px',
        }}
      >
        {proposedList.map((item, index) => (
          <ListItem key={index + item} sx={proposedListItemStyles} onClick={handleOpenVoteModal(item)}>
            {item}
          </ListItem>
        ))}
      </List>

      <h1>
        <FoodBankIcon />
        Last Winner Result
      </h1>
      <List
        sx={{
          height: '200px',
          overflowY: 'scroll',
        }}
      >
        {proposedList.map((item, index) => (
          <ListItem key={index + item} sx={lastWinnerListItemStyles}>
            {item}
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default Vote;

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
