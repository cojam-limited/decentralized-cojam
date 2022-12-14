import React, { useEffect, useState, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom'
import { Modal } from 'react-responsive-modal';
import LogoWhite from '@assets/logo_white.png'
import LogoBlack from '@assets/logo_black.png'

import iconKlip from '@assets//icon_klip.svg'
import iconMetamask from '@assets/icon_metamask.svg'
import Logo_Kaikas from '@assets/logo_kaikas.svg';
import mainBackGround from '@assets/main_visual_img01.jpg';

import { ConnectKaikasButton } from './styles';
//import isMobile from '@utils/isMobile';
import { WALLET_MODAL_DATA_KEY, useModalData } from '@data/modal';
import isMobile from '@utils/isMobile';
import { kaikasLogin, getRewardCojamURI } from '@api/UseKaikas';
import { checkLogin, callGetCojamBalance } from '@api/UseTransactions';

import { prepare, request, getResult } from 'klip-sdk';
import QRCode from 'qrcode';

import toastNotify from '@utils/toast';

import Moment from 'moment';
import { useWalletData } from '@data/wallet';
import { BalanceContext } from '../components/Context/BalanceContext';
import { QrContext } from '../components/Context/QrContext';
import { useLoadingState } from "@assets/context/LoadingContext";

import { client } from "../sanity";
import axios from 'axios';


function Header() {
  const { setLoading } = useLoadingState();
  const { balance, setBalance } = useContext(BalanceContext);
  const { qr, setQr, qrModal, setQrModal, minutes, setMinutes, seconds, setSeconds } = useContext(QrContext);

  const history = useHistory();
  const [openKlipAdd, modalKlipAdd] = useState(false);
  const [currentPage, setCurrentPage] = useState('Home');

  const { modalData, mutateModalData } = useModalData(WALLET_MODAL_DATA_KEY);
  const { walletData, mutateWalletData } = useWalletData();
  const [ memberRole, setMemberRole ] = useState('');

  useEffect(() => {
    //카이카스 설치된 경우
    if (window?.klaytn) {
      window?.klaytn.on('accountsChanged', function (accounts) {
        // 카이카스에서 계정 전환했을 때 지갑 주소 업데이트
        mutateWalletData({ account: accounts[0], type: 'kaikas' });
      });

      window?.klaytn.on('networkChanged', function () {
        // 유저가 네트워크 변경했을 때 지갑 업데이트
        /* toastNotify({
          state: 'warn',
          message: 'network Changed.',
        }); */
      });
    } else {
      //카이카스 설치 안된 경우
      /* toastNotify({
        state: 'error',
        message: 'There is No Kaikas',
      }); */
    }
  }, []);

  //scroll 이벤트 관련
  const isNumber = (balance) => {
    if(balance) {
      const reg = /^\d*\.?\d*$/;
      const isNumber = reg.test(balance);
      
      return isNumber;
    } else {
      return false;
    }
  }

  const handleOpenKaikasModal = async () => {
    setLoading(true);
    
    if(isMobile()) {
      const userAgent = navigator?.userAgent?.toLowerCase();
      if(userAgent && !userAgent?.includes('kaikas')) {
        alert('Kaikas Mobile App을 사용해주세요.');

        // go kaikas mobile app
        const URL = 'decentralized-cojam.vercel.app/';
        location.href = `https://app.kaikas.io/u/${URL}`;
        return;
      }

      await axios.post("https://api.kaikas.io/api/v1/k/prepare",
        { 
          bapp: { name: 'cojam_v1' },
          type: "auth",
          chain_id: "1001"
        }, {
          headers: {            
            'Content-Type': 'application/json; charset=utf-8'
          },
        }).then(async (response) => {
            const { request_key, chain_id } = response.data;

            // request - web 2 app
            location.href = `kaikas://wallet/api?request_key=${request_key}`;
            
            // result
            const klipTimeLimitMs = 60000;
            let time = new Date().getTime();
            const endTime = time + klipTimeLimitMs;
            while (time < endTime) {
              
              const result = { status: 400 };
              if( time % 500 === 0 ) {
                
                await axios.get(`https://api.kaikas.io/api/v1/k/result/${request_key}`)
                           .then((response) => {
                              const { status, result: resResult } = response.data;

                              if(status === "completed") {
                                  mutateWalletData({ account: resResult.klaytn_address, type: 'kaikas' });
                                  result.status = 200;
                              } else if(status === "error") {
                                result.status = 500;
                              }
                            })
                            .catch((error) => {
                              result.status = 500;
                            });
              }
    
              time = result.status !== 400 ? Number.MAX_SAFE_INTEGER : new Date().getTime();
            }

            setLoading(false);
        }).catch((error) => {
            alert(error);
            console.log(error);
            setLoading(false);
        });
    } else {
      const account = await kaikasLogin();
      mutateWalletData({ account: account, type: 'kaikas' });
      setLoading(false);
    }

    mutateModalData({ open: false });
    modalKlipAdd(false);
  }

  const handleClose = () => {
    mutateModalData({ open: false });
  };

  // QR code 생성
  const generateQR = async text => {
    try {
      //setQrImage(await QRCode.toDataURL(text));
      setQr(await QRCode.toDataURL(text));
    } catch (err) {
      console.error(err);
    }
  }

  const handleOpenKlipLogin = async () => {
    const bappName = 'cojam-v2';

    // TODO MODIFY
    const successLink = 'https://decentralized-cojam.vercel.app//';
    const failLink = 'myApp://...';
    const res = await prepare.auth({ bappName, successLink, failLink });

    if (res.err) {
      // 에러 처리
    } else if (res.request_key) {
      const requestKey = res.request_key;
      
      /*
        Mobile 이면, deep link
        아니면, QR code를 통해 이동
      */
      if( !isMobile() ) {
        modalKlipAdd(false);
        setQrModal(true);

        // 5분 시간제한 설정
        setMinutes(5);
        setSeconds(0);

        const url = `https://klipwallet.com/?target=a2a?request_key=${requestKey}`;
        generateQR(url);
      } else {
        // 접속한 환경이 mobile이 아닐 때, Deep Link.
        request(requestKey, () => toastNotify({
          state: 'error',
          message: '모바일 환경에서 실행해주세요',
        }));
      }

      const getAuthResult = setInterval(() => {
        getResult(requestKey).then((authResult) => {
          if(authResult.result?.klaytn_address) {
            clearInterval(getAuthResult);

            modalKlipAdd(false);
            setQrModal(false);
            mutateWalletData({ account: authResult.result.klaytn_address, type: 'klip' });
          }
        });
      }, 1000);
    }
  }

  // JOIN REWARD
  const getjoinReward = () => {
		const walletAddress = walletData.account;

		if(walletAddress) {
			const joinRewardHistQuery = `*[_type == 'joinRewardHistory' && walletAddress == '${walletAddress.toLowerCase()}' && _id != '${Date.now()}'][0]`;
			client.fetch(joinRewardHistQuery).then((joinRewardHistory) => {
			
				if(!joinRewardHistory) {
					const rewardInfoQuery = `*[_type == 'rewardInfo' && isActive == true && rewardType == 'join' && _id != '${Date.now()}'][0]`;
					client.fetch(rewardInfoQuery).then(async (rewardInfo) => {
            if(!rewardInfo.amount) {
              toastNotify({
                state: 'error',
                message: 'join reward amount is not exist',
              });
              return;
            }

						// send coin from master wallet
						let transferRes;
						try {
							transferRes = await getRewardCojamURI({toAddress: walletAddress, amount: Number(rewardInfo.amount)});
						} catch(error) {
              console.log(error);
              debugger;

              toastNotify({
                state: 'error',
                message: 'get join reward api error. try again.',
              });
              
							return;
						}

						if(transferRes.status === 200) {
							// remain transfer history
							const joinRewardHistoryDoc = {
								_type: 'joinRewardHistory',
								walletAddress: walletAddress.toLowerCase(),
								rewardAmount: Number(rewardInfo.amount),
								transactionId: transferRes.transactionId,
								createdDateTime: Moment().format("yyyy-MM-DD HH:mm:ss")
							}

							await client.create(joinRewardHistoryDoc);

              toastNotify({
                state: 'success',
                message: `Welcome! you get the join reward (${Number(rewardInfo.amount)} CT) successfully`,
              });

              // remain transaction history
							const transactionSet = {
								_type: 'transactions',
								amount: Number(rewardInfo.amount),
								recipientAddress: walletAddress.toLowerCase(),
								spenderAddress: transferRes.spenderAddress,
								status: 'SUCCESS',
								transactionId: transferRes.transactionId,
								transactionType: 'JOIN_REWARD',
                createdDateTime: Moment().format('YYYY-MM-DD HH:mm:ss'),
							}

							await client.create(transactionSet);

              const cojamBalance = await callGetCojamBalance(walletData);
							if(cojamBalance !== balance) {
								setBalance(cojamBalance);
							}

							// refresh after get reward success.
							window.location.reload();
						}
					});
				}
			});
		} else {
      toastNotify({
        state: 'error',
        message: 'do login for get login reward.',
      });
		}
	}

  const logout = async () => {
    mutateWalletData({ account: '', type: '' });
    history.push('/');
  }

  const getBalance = async () => {
    if (walletData?.account && walletData?.account !== '') {
      const cojamBalance = await callGetCojamBalance(walletData);

      if(cojamBalance !== balance) {
        setBalance(cojamBalance);
      }
    } else {
      setBalance(-1);
    }
  }

  // header 관련 scroll listner
  useEffect(() => {
    window.addEventListener('scroll', resizeHeaderOnScroll, true);
  }, []);

  // KLIP modal > count down setting
  useEffect(() => {
    if(minutes === 5) {
      setLoading(false);
    }

    const countdown = setInterval(() => {
      if (parseInt(seconds) > 0) {
        setSeconds(parseInt(seconds) - 1);
      }
      if (parseInt(seconds) === 0) {
        if (parseInt(minutes) === 0) {
            clearInterval(countdown);
        } else {
          setMinutes(parseInt(minutes) - 1);
          setSeconds(59);
        }
      }
    }, 1000);

    return () => clearInterval(countdown);
  }, [minutes, seconds]);

  // login 에 따라 wallet, balance 상태 관리
  useEffect(() => {
    getBalance();

    if(walletData && walletData.account) {
      // admin check
      const adminQuery = `*[_type == 'admin' && walletAddress == '${walletData.account.toLowerCase()}' && _id != '${Date.now()}'][0]`;
      client.fetch(adminQuery).then((admin) => {
      
        if(admin) {
          setMemberRole('admin');
        }
      });

      // if new user then, add member info & give a join reward - start
      const getMemberQuery = `*[_type == 'member' && walletAddress == '${walletData.account.toLowerCase()}' && _id != '${Date.now()}'][0]`;
      client.fetch(getMemberQuery).then((member) => {
        if(!member) {
          // send join reward to user
          getjoinReward();

          const memberDoc = {
            _type: 'member',
            _id: String(walletData.account).toLowerCase(),
            memberName: walletData.account,
            walletAddress: walletData.account,
            createdDateTime: Moment().format('yyyy-MM-DD HH:mm:ss'),
            updateDateTime: Moment().add(-1000, 'years').format('yyyy-MM-DD HH:mm:ss')
          }
    
          client.createIfNotExists(memberDoc);
        }
      })
      // if new user then, add member info & give a join reward - end
    } else {
      setMemberRole('');
    }

  }, [walletData, walletData.account]);

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
              <Link to="/QuestList" onClick={(e) => { 
                // prevent Link actual feature
                e.preventDefault();

                let isLogin = false;
                checkLogin(walletData).then((res) => {
                  isLogin = res;

                  if(!isLogin) {
                    toastNotify({
                      state: 'error',
                      message: 'login please',
                    });

                    return;
                  }

                  history.push({ pathname: `/QuestList` }) 
                });
              }}>Quest</Link>
              <Link to="/ResultsList">Results</Link>
              <Link to="/About">About</Link>
              <Link to="/CommunityList">Community</Link>
            </div>
          </dt>
          <dd>
          {
            typeof walletData.account !== 'undefined' && walletData.account !== ''
            ? /* 로그인 했을때 */
              <>
                <h2><span><i className="uil uil-coins"></i>({balance ? (Number.isInteger(balance) ? balance : balance.toFixed(2)) : 0} CT)</span></h2>
                <div>
                  <Link to="/Mypage"><i className="uil uil-user-circle"></i> MYPAGE</Link>
                  {memberRole?.toLowerCase() === 'admin' && <Link to="/Market"><i className="uil uil-user-md"></i> ADMIN</Link>}
                  <Link to="#" onClick={() => { logout() }}><i className="uil uil-sign-out-alt"></i> LOGOUT</Link>
                </div>
              </>
            : /* 로그인 안했을때 */
              <>
                <Link to="#" onClick={() => modalKlipAdd(true)} style={{ color: '#ffffff' }}><i className="uil uil-sign-in-alt"></i> LOGIN</Link>
              </> 
          }
          </dd>
        </dl>
      </div>
      {/* 상단영역 끝 */}


      {/* 상단영역 - 모바일 */}
      <div className="header-mobile">
        <dl>
          <dt>
            <Link to="/"><img src={LogoBlack} alt="" title="" /></Link>
          </dt>
          <dd>
            {}
            {
              typeof walletData.account !== 'undefined' && walletData.account !== ''
              ? /* 로그인 했을때 */
                <> 
                  <Link to="/Mypage"><i className="uil uil-user-circle"></i></Link>
                  {memberRole?.toLowerCase() === 'admin' && <Link to="/Market"><i className="uil uil-user-md"></i></Link>}
                  <Link to="#" onClick={() => { logout() }}><i className="uil uil-sign-out-alt"></i></Link>
                </>
              : /* 로그인 안했을때 */
                <>
                  <Link to="#" onClick={() => modalKlipAdd(true)}><i className="uil uil-sign-in-alt"></i></Link>
                </> 
            }
          </dd>
        </dl>
        <ul>
          {
            balance && balance !== -1 &&
            <>
              <li key={1}><i className="uil uil-coins"></i> {balance ? ( Number.isInteger(balance) ? balance : balance.toFixed(2) ) : 0} CT</li>
              <li key={2}><i className="uil uil-times-circle"></i></li>
            </>
          }
        </ul>
      </div>
      {/* 상단영역 - 모바일 끝 */}

      {/*
        TODO POINT
      */}
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
        </ul>
      </div>
      {/* 모바일 - 하단앱바 */}


      {/* 모달 - 클레이트 연결 */}
      <Modal open={openKlipAdd} onClose={() => modalKlipAdd(false)} center>
        <div 
          className="modal-klip"
          style={{ 
            background: `url('${mainBackGround}') center no-repeat`,
          }}
        >
          <dl>
            <dt><img src={LogoBlack} alt="" title="" /></dt>
            <dd onClick={() => modalKlipAdd(false)}><i className="uil uil-times"></i></dd>
          </dl>

          <div>
            <h2>내 카카오톡으로 간편하고 안전하게 시작할 수 있습니다.</h2>
            <h3>
              <a href="#none" onClick={() => handleOpenKlipLogin()}><img src={iconKlip} alt="" title=""/>카카오톡으로 Klip 지갑 연결</a>
            </h3>
            <h4>
              <a href="#none" style={{ color: '#636363' }}>내 손안의 디지털 지갑, Klip 안내 <i className="uil uil-angle-right"></i></a>
            </h4>
            <dl>
              <dt></dt>
              <dd style={{ color: '#636363' }}>또는</dd>
              <dt></dt>
            </dl>
            <ul>
              <li>
                <ConnectKaikasButton onClick={handleOpenKaikasModal}>
                  <img src={Logo_Kaikas} style={{ marginRight: '5px' }} alt="connect Kaikas" />
                  <span>카이카스 지갑 연결</span>
                </ConnectKaikasButton>
              </li>
              <li>
                <a href="#none"><img src={iconMetamask} alt="" title="" width="20px" /> Metamask 지갑 연결</a>
              </li>
            </ul>
          </div>
        </div>
      </Modal>
      {/* 모달 - 클레이트 연결 끝 */}

      {/* 모달 - KLIP 연결 시작 */}
      <Modal open={qrModal} onClose={() => setQrModal(false)} center>
        <div className="base-modal KlipWeb2AppModal">
          <section className="gen-modal klip-with-qr-modal">
            <div className="gen-modal-close" onClick={() => setQrModal(false)}></div>
            <div className="gen-modal-title">
              <img src="https://klayswap.com/img/icon/ic-service-klip-bk.svg" alt="klip" />
              <label>카카오 Klip QR 연결 </label>
            </div>
            
            <article className="klip-with-qr-modal__body">
              <div className="klip-with-qr-modal__code">
                <div className="klip-with-qr-modal__code__wrapper">
                  <div level="L" background="#fff" foreground="#000" className="">
                    <img style={{width: '100%', height: '100%', top: '0px', left: '0px'}} src={qr} alt="pointer" />
                  </div>
                </div>
                
                <div className="klip-with-qr-modal__code__timer">
                  <p>남은시간 &nbsp;
                    <span>{minutes}분 {seconds}초</span>
                  </p>
                </div>
                
                <div className="klip-with-qr-modal__code__warning"> 
                  QR 코드 리더기 또는 카카오톡 앱을 통해 QR 코드를 스캔해주세요. 
                </div>
              </div>
            </article>
            
            <article className="klip-with-qr-modal__notice">
              <div>
                <div className="klip-with-qr-modal__notice__flow__icon">
                  <img src="https://klayswap.com/img/icon/ic-kakaotalk-logo.svg" alt="klip step1" />
                  <img src="https://klayswap.com/img/icon/ic-pointer-right-bk.svg" alt="pointer" />
                </div>
                
                <div className="klip-with-qr-modal__notice__flow__icon">
                  <img src="https://klayswap.com/img/icon/ic-kakaotalk-search.svg" alt="klip step2" />
                  <img src="https://klayswap.com/img/icon/ic-pointer-right-bk.svg" alt="pointer" />
                </div>
                
                <div className="klip-with-qr-modal__notice__flow__icon">
                  <img src="https://klayswap.com/img/icon/ic-kakaotalk-scan.svg" alt="klip step3" />
                </div>
                
              </div>
              
              <div>
                <div className="klip-with-qr-modal__notice__flow__text">
                  <span>
                    <strong>카카오톡 실행</strong>
                  </span>
                </div>
                
                <div className="klip-with-qr-modal__notice__flow__text">
                  <span><strong>상단 검색창 클릭</strong></span>
                </div>
                
                <div className="klip-with-qr-modal__notice__flow__text">
                  <span><strong>코드 스캔 후 로그인</strong></span>
                </div>
              </div>

              <div className="klip-with-qr-modal__notice__warning">
                <span>* Klip &gt; 코드스캔 (사이드메뉴)에서도 스캔이 가능합니다.</span>
              </div>
            </article>
          </section>
        </div>   
      </Modal>
      {/* 모달 - KLIP 연결 끝 */}
          
    </div>
  );
}

function resizeHeaderOnScroll() {
  const distanceY = window.scrollY || document.body.scrollTop,
  shrinkOn = 50
  
  try {
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
      document.querySelector('.header > dl > dt > div a:hover').style.color = '#00c486';
      document.querySelector('.header > dl > dd > h2').style.color = '#222';
      document.querySelector('.header > dl > dd > h2 > span').style.color = '#222';
      document.querySelector('.header > dl > dd > div > a:nth-child(1)').style.color = '#222';
      document.querySelector('.header > dl > dd > div > a:nth-child(1)').style.background = '#edf3f8';
      document.querySelector('.header > dl > dd > div > a:nth-child(2)').style.color = '#222';
      document.querySelector('.header > dl > dd > div > a:nth-child(2)').style.background = '#edf3f8';
      document.querySelector('.header > dl > dd > div > a:nth-child(3)').style.color = '#222';
      document.querySelector('.header > dl > dd > div > a:nth-child(3)').style.background = '#edf3f8';
      document.querySelector('.header > dl > dt > div > a:hover').style.color = '#00c486';
      
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
      document.querySelector('.header > dl > dt > div a:nth-child(1):hover').style.color = '#00c486';
      document.querySelector('.header > dl > dt > div a:nth-child(2):hover').style.color = '#00c486';
      document.querySelector('.header > dl > dt > div a:nth-child(3):hover').style.color = '#00c486';
      document.querySelector('.header > dl > dt > div a:nth-child(4):hover').style.color = '#00c486';
      document.querySelector('.header > dl > dt > div a:nth-child(5):hover').style.color = '#00c486';
      document.querySelector('.header > dl > dt > div a:hover').style.color = '#00c486';
      document.querySelector('.header > dl > dd > h2').style.color = '#fff';
      document.querySelector('.header > dl > dd > h2 > span').style.color = '#fff';
      document.querySelector('.header > dl > dd > div > a:nth-child(1)').style.color = '#fff';
      document.querySelector('.header > dl > dd > div > a:nth-child(1)').style.background = 'rgba(255,255,255,0.3)';
      document.querySelector('.header > dl > dd > div > a:nth-child(2)').style.color = '#fff';
      document.querySelector('.header > dl > dd > div > a:nth-child(2)').style.background = 'rgba(255,255,255,0.3)';
      document.querySelector('.header > dl > dd > div > a:nth-child(3)').style.color = '#fff';
      document.querySelector('.header > dl > dd > div > a:nth-child(3)').style.background = 'rgba(255,255,255,0.3)';
      document.querySelector('.header > dl > dt > div > a:hover').style.color = '#00c486';
    }
  } catch(e) {
    // ignore
  }
}

window.addEventListener('scroll', resizeHeaderOnScroll);


export default Header;