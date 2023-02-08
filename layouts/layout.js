import React, { useState, useEffect } from 'react';

import Header from "./header";
import Footer from "./footer";
import DaoHeader from "./daoHeader"
import ProposalHeader from "../pages/dao/proposal/header"

import LoadingContext from "../assets/context/LoadingContext";
import LoadingOverlay from "../components/LoadingOverlay";

import toastNotify from '@utils/toast';
import { Icon } from '@iconify/react';
import { useHistory } from "react-router-dom";
import { NftContract } from "../pages/dao/contractHelper";

const Layout = ({ children, toggleMyPage, setToggleMyPage, needNftModal, setNeedNftModal }) => {
  const [ loading, setLoading ] = useState(false);
  const [ account, setAccount ] = useState(window?.klaytn?.selectedAddress?.toLowerCase());
  const [ totalNft, setTotalNft ] = useState(0);

  window.klaytn.on('accountsChanged', (accounts) => {
    setAccount(accounts[0]);
  });

  const skipAccount = account?.slice(0, 6) + '...' + account?.slice(-4);
  const path = window.location.pathname;
  const DAOPathCheck = path.includes('Proposals') || path.includes('VotingHistory') || path.includes('RewardHistory')
  const history = useHistory();
  const CloseMyPageHandler = () => {
    if (toggleMyPage === true) {
      setToggleMyPage(false);
    }
  }
  const CloseNeedNftModalHandler = () => {
    if (needNftModal) {
      setNeedNftModal(false);
      history.push('/Dao/DaoProposals');
    }
  }

  useEffect(async () => {
    if(account !== undefined || null) {
      try {
        const balance = await NftContract().methods.balanceOf(account).call();
        setTotalNft(balance)
      } catch(err) {
        console.error(err)
      }
    }
  }, [account])

  const copyText = () => {
    if(account !== undefined || null) {
      try {
        window.navigator.clipboard.writeText(account)
        toastNotify({
          state: 'success',
          message: 'Success Wallet Address Copy!',
        });
      } catch(e) {
        console.log(e)
        toastNotify({
          state: 'error',
          message: 'Failed Wallet Address Copy!',
        });
      }
    }
  }

  const PageMoveHandler = (url) => {
    if(totalNft === 0) {
      toastNotify({
        state: 'error',
        message: 'You Need Membership NFT',
      })
      return;
    }
    
    history.push('/Dao/' + url);
    setToggleMyPage(false);
  }

  return (
    <div className={`${toggleMyPage ? 'dimmed-wrap' : ''} ${needNftModal ? 'proposal-dimmed-wrap' : ''}`}>
      <div
        className={`${toggleMyPage ? 'dimmed-layer' : ''} ${needNftModal ? 'proposal-dimmed-layer' : ''}`}
        onClick={CloseMyPageHandler}
      ></div>
      {toggleMyPage ?
        (
          <div className='mypage'>
            <h2>My Page</h2>
            <h3>{skipAccount}</h3>
            <p
              style={{cursor: 'pointer'}}
              onClick={copyText}
            >
              <div>{skipAccount}</div>
              <i>
                <Icon icon="ph:copy-simple-thin" />
              </i>
            </p>
            <div>
              <p>NFT</p>
              <p>{totalNft}/5</p>
            </div>
            <ul>
              <li onClick={() => PageMoveHandler('DaoProposals')}>Proposal</li>
              <li onClick={() => PageMoveHandler('VotingHistory')}>Voting History</li>
              <li onClick={() => PageMoveHandler('RewardHistory')}>Reward History</li>
            </ul>
          </div>
        )
        :
        (null)
      }
      
      <LoadingContext loading={loading} setLoading={setLoading}>
        {loading && <LoadingOverlay />}
      {
        DAOPathCheck ?
        (
          <>
            <ProposalHeader
              toggleMyPage={toggleMyPage}
              setToggleMyPage={setToggleMyPage}
              account={account}
              totalNft={totalNft}
            />
              {children}
            <Footer />
            {
              needNftModal ? (
                <div className='nft-notice-modal' >
                  <p>You need 5 membership NFTs</p>
                  <button
                    onClick={CloseNeedNftModalHandler}
                  >확인</button>
                </div>
              ) : (
                null
              )
            }
          </>
        )
        :
        path.includes('Dao') ?
        (
          <>
            <DaoHeader
              toggleMyPage={toggleMyPage}
              setToggleMyPage={setToggleMyPage}
              account={account}
              totalNft={totalNft}
            />
              {children}
            <Footer />
          </>
        )
        :
        (
          <>
            <Header />
              {children}
            <Footer />
          </>
        )
      }
      </LoadingContext>
    </div>
  )
}

// eslint-disable-next-line import/no-anonymous-default-export
export default Layout;