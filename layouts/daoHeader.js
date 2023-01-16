import React, { useState } from 'react'
import { Link, useHistory } from "react-router-dom";
import LogoBlack from '@assets/logo_black.png'

const daoHeader = ({toggleMyPage, setToggleMyPage}) => {
  const path = window.location.pathname;
  const history = useHistory();
  const [currentPage, setCurrentPage] = useState('Dao');
  const OpenMyPageHandler = () => {
    if (toggleMyPage === false) {
      setToggleMyPage(true);
    }
  }
  return (
    <div className={`dao-header ${path.includes('DaoView') ? 'detail' : ''}`}>
      <div>
        <h1>
          <Link to="/">
            <img src={LogoBlack} alt="Logo" />
          </Link>
        </h1>
      </div>
      <div>
        <p onClick={OpenMyPageHandler}>
          Wallet Address
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