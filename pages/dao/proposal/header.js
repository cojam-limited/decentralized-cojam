import React, { useEffect } from 'react'
import { Icon } from '@iconify/react';
import { useHistory } from 'react-router-dom'
import toastNotify from '@utils/toast';
import { NftContract } from "../contractHelper";

const header = ({toggleMyPage, setToggleMyPage, account, setAccount}) => {
  const path = window.location.pathname;
  const titleArray = path.split('/')[2];
  const title = titleArray.includes('Proposals') ? 'Proposals' : titleArray.includes('VotingHistory') ? 'Voting History' : 'Reward History';
  const history = useHistory();
  const amdinContractAddress = '0x867385AcD7171A18CBd6CB1ddc4dc1c80ba5fD52';
  const walletData = sessionStorage.getItem('data/wallet');

  window.klaytn.on('accountsChanged', (accounts) => {
    setAccount(accounts[0]);
  });

  const OpenMyPageHandler = () => {
    if (toggleMyPage === false) {
      setToggleMyPage(true);
    }
  }

  const goBackHandler = () => {
    history.goBack();
  }

  useEffect(async () => {
    if(!account) {
      if(!walletData || walletData === '{"account":"","type":""}') {
        toastNotify({
          state: 'error',
          message: 'Please Login First from the Main page.',
        })
        history.push('/');
        return;
      }
    }

    if(account){
      try {
        if(account?.toLowerCase() === amdinContractAddress?.toLowerCase()) {
          toastNotify({
            state: 'success',
            message: `Success Login Admin Account\n"${account}"`,
          });
          return;
        }

        if(await window.klaytn._kaikas.isUnlocked() === false) {
          await window.klaytn.enable();
        }
  
        const balance = await NftContract().methods.balanceOf(account).call();
        if(balance <= 0) {
          toastNotify({
            state: 'error',
            message: 'You Need Membership NFT',
          })
          history.push({pathname: `/`})
          return;
        }
    
        if(account !== undefined || account !== null) {
          toastNotify({
            state: 'success',
            message: `Success Login Account\n"${account}"`,
          });
        }
      } catch(err) {
        console.error(err)
      }
    }
  }, [account])

  return (
    <div className='proposal-header'>
      <div>
        <Icon
          icon="material-symbols:keyboard-arrow-left"
          className='arrow'
          onClick={goBackHandler}
        />
        <div className='account'>
          <p onClick={OpenMyPageHandler}>
            {account}
          </p>
        </div>
        <h2>{title}</h2>
      </div>
    </div>
  )
}

export default header