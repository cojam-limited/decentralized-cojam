import React, { useState, useEffect, useRef } from 'react';
import AlertIcon from '@mui/icons-material/ErrorOutlineOutlined';
import Button from '@components/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { Container, UploadContainer, noListStyles, proposedListItemStyles } from './styles';

import toastNotify from '@utils/toast';
import { useWalletData } from '@data/wallet';
import { proposeMenu, isBadgemealMasterNFTholder, getProposalList } from '@api/UseKaikas';

function ProposeMenu() {
  const inputRef = useRef();
  const { walletData } = useWalletData();
  const [proposedList, setProposedList] = useState([]);

  const getProposals = async () => {
    try {
      const res = await getProposalList();
      setProposedList(res);
      console.log(res);
    } catch (error) {
      console.error(error);
    }
  };

  const checkWalletConnection = () => {
    if (!walletData?.account) {
      toastNotify({
        state: 'error',
        message: 'Please connect wallet.',
      });
      return false;
    } else return true;
  };

  const handleClickUploadMenu = async () => {
    try {
      /**
      1. 지갑연동 체크
      2. input에 메뉴 이름을 입력했는지 체크한다.
      3. 메뉴 추가 버튼을 클릭한다.
      4. 마스터 배지 NFT 소유자가 아닐 경우 에러가 발생하는데 토스트메세지로 에러를 보여준다.
      5. 소유자라면 메뉴 추가 함수를 실행한다.
     */
      if (!checkWalletConnection()) return;

      if (!inputRef.current.value) {
        toastNotify({
          state: 'error',
          message: 'Enter what you want to eat.',
        });
        return;
      }

      const isMasterNFTHolder = await isBadgemealMasterNFTholder();
      if (!isMasterNFTHolder) {
        toastNotify({
          state: 'error',
          message: 'You have no right to propose.',
        });
        return;
      } else {
        await proposeMenu(inputRef.current.value);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProposals();
  }, []);

  return (
    <Container>
      <h1>Current Proposed List</h1>
      <List
        sx={{
          height: '200px',
          overflowY: 'scroll',
        }}
      >
        {!proposedList.length ? (
          <div style={noListStyles}>There is no Proposed List.</div>
        ) : (
          proposedList.map((item) => (
            <ListItem key={item.name + item.proposer} sx={proposedListItemStyles}>
              {item.name}
            </ListItem>
          ))
        )}
      </List>

      <UploadContainer>
        <div className="onlymaster">
          <AlertIcon color="warning" />
          <h1> Only Master NFT Owner</h1>
        </div>
        <input type="text" ref={inputRef} placeholder="enter what you want to eat" />
        <Button text="Upload your Menu" onClick={handleClickUploadMenu}></Button>
      </UploadContainer>
    </Container>
  );
}

export default ProposeMenu;
