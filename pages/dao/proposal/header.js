import React, { useEffect } from 'react'
import { Icon } from '@iconify/react';
import { useHistory } from 'react-router-dom'
import toastNotify from '@utils/toast';
import { NftContract } from "../contractHelper";

const header = ({toggleMyPage, setToggleMyPage, account}) => {
  const path = window.location.pathname;
  const titleArray = path.split('/')[2];
  const title = titleArray.includes('Proposals') ? 'Proposals' : titleArray.includes('VotingHistory') ? 'Voting History' : 'Reward History';
  const history = useHistory();
  const amdinContractAddress = process.env.REACT_APP_ADMIN_ADDRESS;

  const OpenMyPageHandler = () => {
    if (toggleMyPage === false) {
      setToggleMyPage(true);
    }
  }

  const goBackHandler = () => {
    history.goBack();
  }

  useEffect(async () => {
    if(account !== undefined || null){
      try {
        if(account?.toLowerCase() === amdinContractAddress?.toLowerCase()) {
          toastNotify({
            state: 'success',
            message: `Success Login Admin Account\n"${account}"`,
          });
          return;
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
    
        if(account !== undefined || null) {
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