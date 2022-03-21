import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useHistory } from 'react-router-dom'
import { Modal } from 'react-responsive-modal';
import LogoWhite from '../assets/image/common/logo_white.png'
import LogoBlack from '../assets/image/common/logo_black.png'

import CloseIcon from '@components/CloseIcon';
import { ModalWrapper, ModalContents, ConnectKlipButton, ConnectKaikasButton } from './styles';
import Logo_Kaikas from '@assets/logo_kaikas.svg';
import isMobile from '@utils/isMobile';
import { KLIP_MODAL_DATA_KEY, WALLET_MODAL_DATA_KEY, useModalData } from '@data/modal';
import { kaikasLogin } from '@api/UseKaikas';
import { useWalletData } from '@data/wallet';
import toastNotify from '@utils/toast';

function Header() {
  const history = useHistory()
  const [openKlipAdd, modalKlipAdd] = useState(false);
  const { modalData, mutateModalData } = useModalData(WALLET_MODAL_DATA_KEY);
  const { mutateModalData: mutateKlipModalData } = useModalData(KLIP_MODAL_DATA_KEY);
  const { mutateWalletData } = useWalletData();
  //scroll 이벤트 관련

  const handleClose = () => {
    mutateModalData({ open: false });
  };

  const handleOpenKaikasModal = async () => {
    if (!isMobile()) {
      const account = await kaikasLogin();
      mutateWalletData({ account });
      mutateModalData({ open: false });
    } else {
      toastNotify({
        state: 'error',
        message: 'Not Support MoblieWeb.',
      });
    }
  };

  useEffect(() => {
    console.log('aaaaaaa', window);
    window.addEventListener('scroll', function() { console.log('scroll.') });
    console.log('bbbbbbb', window);

    return window.removeEventListener('scroll', function() { console.log('scroll.') });
  }, []);

  return (
    <div>
      {/* 상단영역 */}
      <div className="header" id="header">
        <dl>
          <dt>
            <h2>
              <Link to="/"><img src={LogoWhite} alt="" title="" /></Link>
            </h2>
            <div>
              <Link to="/">Home</Link>
              <Link to="/QuestList">Quest</Link>
              <Link to="/ResultsList">Results</Link>
              <Link to="/About">About</Link>
              <Link to="/CommunityList">Community</Link>
            </div>
          </dt>
          <dd>
            {/* 로그인 했을때 */}
            {/*<h2><i className="uil uil-user-circle"></i> dongseokKim <span>(49,75aCT)</span></h2>
            <div>
              <Link to="/Mypage"><i className="uil uil-user-circle"></i> MYPAGE</Link>
              &nbsp;
              <Link to="#"><i className="uil uil-sign-out-alt"></i> LOGOUT</Link>
            </div>
            <KaikasLogin />
            */}
            {/* 로그인 안했을때 */}
            <h2><span></span></h2>
            {<div>
              <Link to="#none"><i className="uil uil-user-circle"></i> JOIN</Link>
              
              <Link to="#none" onClick={() => modalKlipAdd(true)}><i className="uil uil-sign-in-alt"></i> LOGIN</Link>
            </div>}
          </dd>
        </dl>
      </div>
      {/* 상단영역 끝 */}


      {/* 상단영역 - 모바일 */}
      <div className="header-mobile">
        <dl>
          <dt>
            <Link to="../main/index.html"><img src={LogoBlack} alt="" title="" /></Link>
          </dt>
          <dd>
            {/* 로그인 했을때 */}
            {/* <Link to="#"><i className="uil uil-wallet"></i></Link>
            <Link to="/Mypage"><i className="uil uil-user-circle"></i></Link>
            <Link to="#"><i className="uil uil-sign-out-alt"></i></Link> */}
            {/* 로그인 안했을때 */}
            <Link to="#none"><i className="uil uil-user-circle"></i></Link>
            <Link to="#none" onClick={() => modalKlipAdd(true)}><i className="uil uil-sign-in-alt"></i></Link>
          </dd>
        </dl>
        <ul>
          <li><i className="uil uil-coins"></i> 1,000,000</li>
          <li><i className="uil uil-times-circle"></i></li>
        </ul>
      </div>
      {/* 상단영역 - 모바일 끝 */}


      {/* 모바일 - 하단앱바 */}
      <div className="footer-mobile">
        <ul>
          <li onClick={()=>{ history.push('/') }}>
            <p><i className="uil uil-estate"></i></p>
            <div>Home</div>
          </li>
          <li onClick={()=>{ history.push('/QuestList') }} className="active">
            <p><i className="uil uil-file-question-alt"></i></p>
            <div>Quest</div>
          </li>
          <li onClick={()=>{ history.push('/ResultsList') }}>
            <p><i className="uil uil-book"></i></p>
            <div>Results</div>
          </li>
          <li onClick={()=>{ history.push('/About') }}>
            <p><i className="uil uil-building"></i></p>
            <div>About</div>
          </li>
          <li onClick={()=>{ history.push('/CommunityList') }}>
            <p><i className="uil uil-newspaper"></i></p>
            <div>Community</div>
          </li>
        </ul>
      </div>
      {/* 모바일 - 하단앱바 */}


      {/* 모달 - 클레이트 연결 */}
      <Modal open={openKlipAdd} onClose={() => modalKlipAdd(false)} center>
        <div className="modal-klip">
          <dl>
            <h1>Connect Wallet</h1>
            <CloseIcon handleClose={handleClose} />
            {/* <ConnectKlipButton onClick={handleOpenKlipModal}>
              <img src={Logo_Klip} style={{ marginRight: '5px' }} alt="connect Klip" />
              <span>Connect Klip via Kakao</span>
            </ConnectKlipButton> */}
            <ConnectKaikasButton onClick={handleOpenKaikasModal}>
              <img src={Logo_Kaikas} style={{ marginRight: '5px' }} alt="connect Kaikas" />
              <span>Kaikas by Klaytn</span>
            </ConnectKaikasButton>
          </dl>
        </div>
      </Modal>
      {/* 모달 - 클레이트 연결 끝 */}
    </div>
  );
}


function resizeHeaderOnScroll() {
  console.log('resize !!! ');

  const distanceY = window.pageYOffset || document.documentElement.scrollTop,
  shrinkOn = 50
  //header = document.getElementById('header');

  if (distanceY > shrinkOn) {
    document.querySelector('.header').style.background = '#fff';
    document.querySelector('.header').style.boxShadow = '0 0 10px 0 rgba(0,0,0,0.15)';
    document.querySelector('.header > dl > dt > h2 > a img').src = LogoBlack;
    document.querySelector('.header > dl > dt > div').style.padding = '15px 0';
    document.querySelector('.header > dl > dt > div a:nth-child(1)').style.color = '#222';
    document.querySelector('.header > dl > dt > div a:nth-child(2)').style.color = '#222';
    document.querySelector('.header > dl > dt > div a:nth-child(3)').style.color = '#222';
    document.querySelector('.header > dl > dt > div a:nth-child(4)').style.color = '#222';
    document.querySelector('.header > dl > dt > div a:nth-child(5)').style.color = '#222';
    document.querySelector('.header > dl > dd > h2').style.color = '#222';
    document.querySelector('.header > dl > dd > h2 > span').style.color = '#222';
    document.querySelector('.header > dl > dd > div > a:nth-child(1)').style.color = '#222';
    document.querySelector('.header > dl > dd > div > a:nth-child(1)').style.background = '#edf3f8';
    document.querySelector('.header > dl > dd > div > a:nth-child(2)').style.color = '#222';
    document.querySelector('.header > dl > dd > div > a:nth-child(2)').style.background = '#edf3f8';
  } else {
    document.querySelector('.header').style.background = 'none';
    document.querySelector('.header').style.boxShadow = 'none';
    document.querySelector('.header > dl > dt > h2 > a img').src = LogoWhite;
    document.querySelector('.header > dl > dt > div').style.padding = '20px 0';
    document.querySelector('.header > dl > dt > div a:nth-child(1)').style.color = '#fff';
    document.querySelector('.header > dl > dt > div a:nth-child(2)').style.color = '#fff';
    document.querySelector('.header > dl > dt > div a:nth-child(3)').style.color = '#fff';
    document.querySelector('.header > dl > dt > div a:nth-child(4)').style.color = '#fff';
    document.querySelector('.header > dl > dt > div a:nth-child(5)').style.color = '#fff';
    document.querySelector('.header > dl > dd > h2').style.color = '#fff';
    document.querySelector('.header > dl > dd > h2 > span').style.color = '#fff';
    document.querySelector('.header > dl > dd > div > a:nth-child(1)').style.color = '#fff';
    document.querySelector('.header > dl > dd > div > a:nth-child(1)').style.background = 'rgba(255,255,255,0.3)';
    document.querySelector('.header > dl > dd > div > a:nth-child(2)').style.color = '#fff';
    document.querySelector('.header > dl > dd > div > a:nth-child(2)').style.background = 'rgba(255,255,255,0.3)';
  }
}

window.addEventListener('scroll', resizeHeaderOnScroll);


export default Header;