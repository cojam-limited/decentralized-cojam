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

import { urlFor, client } from "../sanity";

const Layout = ({ children, toggleMyPage, setToggleMyPage, needNftModal, setNeedNftModal, setCheckDao }) => {
  const [ loading, setLoading ] = useState(false);
  const [ account, setAccount ] = useState(window?.klaytn?.selectedAddress);
  const [ totalNft, setTotalNft ] = useState(0);
  const [ bannerImage, setBannerImage ] = useState();

  const path = window.location.pathname;
  const skipAccount = account?.slice(0, 6).toUpperCase() + '...' + account?.slice(-4).toUpperCase();
  const DAOPathCheck = path.includes('Proposals') || path.includes('VotingHistory') || path.includes('RewardHistory')
  const history = useHistory();

  useEffect(() => {
		setLoading(true);
		// banner image 조회
		const imageQuery = `*[_type == 'pageImages' && imageTitle == 'main01' && pageTitle == 'main'][0]`;
		client.fetch(imageQuery).then((image) => {
			if(image) {
				setBannerImage(image.pageImage);
			}
			setLoading(false);
		});
	}, []);

  useEffect(() => {
    if(path.includes('Dao') || path.includes('dao')) {
      setCheckDao(true)
    } else {
      setCheckDao(false)
    }
  }, [path])

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
    if(account) {
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
    <div 
      style={{
        background: `${
          `${(path.includes('Dao') && bannerImage) ? `url(${urlFor(bannerImage)})` : null} center no-repeat`
        }`,
        backgroundSize: `${
          `${(path.includes('Dao') && bannerImage) ? `cover` : null}`
        }`,
        height: '100%',
      }}
      className={`${path.includes('Dao') ? 'layout-wrap' : ''}`}
    >
      <div 
        className={`${path.includes('Dao') ? 'dimmed-wrap' : ''} ${toggleMyPage ? 'open-mypage' : ''} ${needNftModal ? 'proposal-dimmed-wrap' : ''}`}
      >
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
                <span>{skipAccount}</span>
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
                setAccount={setAccount}
                totalNft={totalNft}
              />
                {children}
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
          path.includes('Dao') || path.includes('dao') ?
          (
            <>
              <DaoHeader
                toggleMyPage={toggleMyPage}
                setToggleMyPage={setToggleMyPage}
                account={account}
                setAccount={setAccount}
              />
                {children}
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
    </div>
  )
}

// eslint-disable-next-line import/no-anonymous-default-export
export default Layout;