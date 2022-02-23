import React, { useState, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListAltIcon from '@mui/icons-material/ListAlt';
import FoodBankIcon from '@mui/icons-material/FoodBankOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import { Container, proposedListItemStyles, winnerListItemStyles, noListStyles } from './styles';
import { VOTE_MODAL_DATA_KEY, useModalData } from '@data/modal';
import { getProposalList, getWinnerProposalList } from '@api/UseKaikas';

function Vote() {
  const { mutateModalData } = useModalData(VOTE_MODAL_DATA_KEY);
  const [proposedList, setProposedList] = useState([]);
  const [winnerProposalList, setWinnerProposalList] = useState([]);
  const [proposedListLoading, setProposedListLoading] = useState(false);
  const [winnerProposalListLoading, setWinnerProposalListLoading] = useState(false);

  const getProposals = async () => {
    try {
      setProposedListLoading(() => true);
      const res = await getProposalList();
      setProposedListLoading(() => false);
      setProposedList(() => res);
      console.log(res);
    } catch (error) {
      console.error(error);
      setProposedListLoading(() => false);
    }
  };
  const getWinnerProposals = async () => {
    try {
      setWinnerProposalListLoading(() => true);
      const res = await getWinnerProposalList();
      setWinnerProposalListLoading(() => false);
      setWinnerProposalList(() => res);
      console.log(res);
    } catch (error) {
      console.error(error);
      setWinnerProposalListLoading(() => false);
    }
  };

  const handleOpenVoteModal = (menu, menuIndex) => () => {
    mutateModalData({ open: true, menu, menuIndex });
  };

  useEffect(() => {
    getProposals();
    getWinnerProposals();
  }, []);

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
        {proposedListLoading ? (
          <CircularProgress />
        ) : !proposedList.length ? (
          <div style={noListStyles}>There is no Proposed List.</div>
        ) : (
          proposedList.map((item, index) => (
            <ListItem
              onClick={handleOpenVoteModal(item.name, index)}
              key={item.name + item.proposer}
              sx={proposedListItemStyles}
            >
              {item.name}
            </ListItem>
          ))
        )}
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
        {winnerProposalListLoading ? (
          <CircularProgress />
        ) : !winnerProposalList.length ? (
          <div style={noListStyles}>There is no Winner.</div>
        ) : (
          winnerProposalList.map((item) => (
            <ListItem onClick={handleOpenVoteModal} key={item.name + item.proposer} sx={winnerListItemStyles}>
              {item.name}
            </ListItem>
          ))
        )}
      </List>
    </Container>
  );
}

export default Vote;
