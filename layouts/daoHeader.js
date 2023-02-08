import React, { useState, useEffect } from 'react'
import { Link, useHistory } from "react-router-dom";
import LogoBlack from '@assets/logo_black.png'
import toastNotify from '@utils/toast';
import { NftContract } from "../pages/dao/contractHelper";

const daoHeader = ({toggleMyPage, setToggleMyPage, account}) => {
  const path = window.location.pathname;
  const history = useHistory();
  const [currentPage, setCurrentPage] = useState('Dao');
  const amdinContractAddress = '0x867385AcD7171A18CBd6CB1ddc4dc1c80ba5fD52';

  const OpenMyPageHandler = () => {
    if (toggleMyPage === false) {
      setToggleMyPage(true);
    }
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
    <div className={`dao-header ${path.includes('DaoView') ? 'detail' : ''}`}>
      <div>
        <h1>
          <Link to="/">
            <img src={LogoBlack} alt="Logo" />
          </Link>
        </h1>
      </div>
      <div className='account'>
        <p onClick={OpenMyPageHandler}>
          {account}
        </p>
      </div>
      {/* 모바일 - 하단앱바 */}
      <div className="footer-mobile">
        <ul>
          <li onClick={()=>{ setCurrentPage('Home'); history.push('/'); }} className={currentPage === 'Home' ? 'active' : ''}>
            <p><i className="uil uil-estate"></i></p>
            <div>Home</div>
          </li>
          <li onClick={()=>{ setCurrentPage('Quest'); history.push('/QuestList') }} className={currentPage === 'Quest' ? 'active' : ''}>
            <p><i className="uil uil-file-question-alt"></i></p>
            <div>Quest</div>
          </li>
          <li onClick={()=>{ setCurrentPage('Result'); history.push('/ResultsList') }} className={currentPage === 'Result' ? 'active' : ''}>
            <p><i className="uil uil-book"></i></p>
            <div>Results</div>
          </li>
          <li onClick={()=>{ setCurrentPage('About'); history.push('/About') }} className={currentPage === 'About' ? 'active' : ''}>
            <p><i className="uil uil-building"></i></p>
            <div>About</div>
          </li>
          <li onClick={()=>{setCurrentPage('Community'); history.push('/CommunityList') }} className={currentPage === 'Community' ? 'active' : ''}>
            <p><i className="uil uil-newspaper"></i></p>
            <div>Community</div>
          </li>
          <li onClick={()=>{setCurrentPage('Dao'); history.push('/Dao') }} className={currentPage === 'Dao' ? 'active' : ''}>
            <p><i className="uil uil-newspaper"></i></p>
            <div>Dao</div>
          </li>
        </ul>
      </div>
      {/* 모바일 - 하단앱바 */}
    </div>
  )
}

export default daoHeader