import React, { useState } from 'react';

import Header from "./header";
import Footer from "./footer";
import DaoHeader from "./daoHeader"
import ProposalHeader from "../pages/dao/proposal/header"
import ProposalCreate from "../pages/dao/proposal/create"
import ProposalView from '../pages/dao/proposal/view'
import DaoProposal from "../pages/dao/proposal/proposal"

import LoadingContext from "../assets/context/LoadingContext";
import LoadingOverlay from "../components/LoadingOverlay";

import toastNotify from '@utils/toast';
import { Icon } from '@iconify/react';
import { Link, useHistory } from "react-router-dom";

const Layout = ({ children, needNftModal, setNeedNftModal }) => {
  const [loading, setLoading] = useState(false);
  const [toggleMyPage, setToggleMyPage] = useState(false);
  const getSession = sessionStorage?.getItem('data/wallet')?.replace(/[{}]/g, '');
  const account = getSession?.split(',')[0]?.split(':')[1]?.replace(/["]/g, '');
  const skipAccount = account?.slice(0, 6) + '...' + account?.slice(-4);
  const path = window.location.pathname;
  const history = useHistory();
  const CloseMyPageHandler = () => {
    if (toggleMyPage === true) {
      setToggleMyPage(false);
    }
  }
  const CloseNeedNftModalHandler = () => {
    if (needNftModal) {
      setNeedNftModal(false);
    }
  }

  const copyText = () => {
    try {
      window.navigator.clipboard.writeText(account)
      toastNotify({
        state: 'success',
        message: 'Success Wallet Address Copy!',
      });
    } catch(e) {
      console.log(e)
    }
  }

  const PageMoveHandler = (url) => {
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
            <p onClick={copyText}>
              <div>{skipAccount}</div>
              <i>
                <Icon icon="ph:copy-simple-thin" />
              </i>
            </p>
            <div>
              <p>NFT</p>
              <p>1/5</p>
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
        path.includes('Dao' && 'Proposals') ?
        (
          <>
            <ProposalHeader />
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