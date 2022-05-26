import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom'
import { Modal } from 'react-responsive-modal';
import LogoWhite from '@assets/logo_white.png'
import LogoBlack from '@assets/logo_black.png'

import iconKlip from '@assets//icon_klip.svg'
import iconMetamask from '@assets/icon_metamask.svg'
import Logo_Kaikas from '@assets/logo_kaikas.svg';

import { ConnectKaikasButton } from './styles';
//import isMobile from '@utils/isMobile';
import { WALLET_MODAL_DATA_KEY, useModalData } from '@data/modal';
import isMobile from '@utils/isMobile';
import { kaikasLogin, isKaikasUnlocked, transferCojamURI, getCojamBalance } from '@api/UseKaikas';
import { prepare, request, getResult } from 'klip-sdk';
import QRCode from 'qrcode';

import Moment from 'moment';
import { useWalletData } from '@data/wallet';

import { client } from "../sanity";

function Header() {
  const history = useHistory()
  const [openKlipAdd, modalKlipAdd] = useState(false);
  const [openKlipLogin, modalKlipLogin] = useState(false);
  const [qrImage, setQrImage] = useState('');
  const [countDownText, setCountDownText] = useState('');

  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const { modalData, mutateModalData } = useModalData(WALLET_MODAL_DATA_KEY);
  //const { mutateModalData: mutateKlipModalData } = useModalData(KLIP_MODAL_DATA_KEY);
  const { walletData, mutateWalletData } = useWalletData();
  const [ balance, setBalance ] = useState(-1);
  const [ isLogin, setIsLogin ] = useState(false);
  const [ memberRole, setMemberRole ] = useState('');

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
    const account = await kaikasLogin();
    mutateWalletData({ account: account, type: 'kaikas' });
    mutateModalData({ open: false });
    modalKlipAdd(false);
  }

  const handleClose = () => {
    mutateModalData({ open: false });
  };

  // QR code 생성
  const generateQR = async text => {
    try {
      setQrImage(await QRCode.toDataURL(text));
    } catch (err) {
      console.error(err);
    }
  }

  const handleOpenKlipLogin = async () => {
    console.log('handle open klip login');

    const bappName = 'cojam-v2';
    const successLink = 'myApp://...';
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
        modalKlipLogin(true);

        // 5분 시간제한 설정
        setMinutes(5);
        setSeconds(0);

        const url = `https://klipwallet.com/?target=a2a?request_key=${requestKey}`;
        generateQR(url);
      } else {
        request(requestKey, () => alert('모바일 환경에서 실행해주세요'));
      }

      const getAuthResult = setInterval(() => {
        getResult(requestKey).then((authResult) => {
          if(authResult.result?.klaytn_address) {
            clearInterval(getAuthResult);

            modalKlipLogin(false);
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
			const joinRewardHistQuery = `*[_type == 'joinRewardHistory' && walletAddress == '${walletAddress}'][0]`;
			client.fetch(joinRewardHistQuery).then((joinRewardHistory) => {
			
				if(joinRewardHistory) {
					alert("you've got reward already.");
				} else {
					const rewardInfoQuery = `*[_type == 'rewardInfo' && isActive == true && rewardType == 'join'][0]`;
					client.fetch(rewardInfoQuery).then(async (rewardInfo) => {
            if(!rewardInfo.amount) {
              alert('join reward amount is not exist');
              return;
            }

						// send coin from master wallet
						let transferRes;
            const rewardAddress = '0xfA4fF8b168894141c1d6FAf21A58cb3962C93B84'; // KAS reward wallet - no CT
						try {
							transferRes = await transferCojamURI({fromAddress: rewardAddress, toAddress: walletAddress, amount: Number(rewardInfo.amount)});
						} catch(error) {
              console.log(error);

							//ignore
							alert('transfer api error. try again.');
							return;
						}

						if(transferRes.status) {
							// remain transfer history
							const joinRewardHistoryDoc = {
								_type: 'joinRewardHistory',
								walletAddress: walletAddress,
								rewardAmount: Number(rewardInfo.amount),
								transactionId: transferRes.transactionId,
								createDateTime: Moment().format("yyyy-MM-DD HH:mm:ss")
							}

							client.create(joinRewardHistoryDoc).then((res) => {
								console.log('join reward hist create result', res);
							});

              alert(`Welcome! you get the join reward (${Number(rewardInfo.amount)} CT) successfully`);

              // remain transaction history
							const transactionSet = {
								_type: 'transactions',
								amount: Number(rewardInfo.amount),
								recipientAddress: walletAddress,
								spenderAddress: rewardAddress,
								status: 'SUCCESS',
								transactionId: transferRes.transactionId,
								transactionType: 'JOIN_REWARD',
                createdDateTime: Moment().format('YYYY-MM-DD HH:mm:ss'),
							}

							client.create(transactionSet);
						}

						console.log('transfer history complete');
					});
				}
			});
		} else {
			alert('do login for get login reward.');
		}
	}

  const logout = async () => {
    mutateWalletData({ account: '', type: '' });
  }

  const getBalance = async () => {
    if (walletData?.account && walletData?.account !== '') {
      const cojamBalance = await getCojamBalance(walletData.account);

      const newBalance = cojamBalance / 10 ** 18;
      if(newBalance !== balance) {
        setBalance(newBalance);
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
    console.log('wallet address changed', walletData, walletData.account);

    getBalance();

    if(walletData && walletData.account) {
      const memberQuery = `*[_type == 'member' && walletAddress == '${walletData.account}'][0] {memberRole}`;
      client.fetch(memberQuery).then((memberRole) => {
        if(memberRole) {
          console.log('reload memberRole', memberRole.memberRole);
          setMemberRole(memberRole.memberRole);
        }
      });

      // if new user then, add member info & give a join reward - start
      const getMemberQuery = `*[_type == 'member' && walletAddress == '${walletData.account}'][0]`;
      client.fetch(getMemberQuery).then((member) => {
        if(!member) {
          // send join reward to user
          getjoinReward();
        }
      })

      const memberDoc = {
        _type: 'member',
        _id: walletData.account,
        memberName: walletData.account,
        walletAddress: walletData.account,
        createdDateTime: Moment().format('yyyy-MM-DD HH:mm:ss')
      }

      client.createIfNotExists(memberDoc);

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
              <Link to="/QuestList">Quest</Link>
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
                  <h2><i className="uil uil-user-circle"></i> <span>({balance ? (Number.isInteger(balance) ? balance : balance.toFixed(3)) : 0} CT,  {walletData.account?.substring(0, 10) + '...'})</span></h2>
                  <div>
                    <Link to="/Mypage"><i className="uil uil-user-circle"></i> MYPAGE</Link>
                    {memberRole?.toLowerCase() === 'admin' && <Link to="/Market"><i className="uil uil-user-md"></i> ADMIN</Link>}
                    {/*<Link to="/Account"><i className="uil uil-user-circle"></i> ACCOUNT</Link>*/}
                    <Link to="#" onClick={() => { logout() }}><i className="uil uil-sign-out-alt"></i> LOGOUT</Link>
                  </div>
                </>
              : /* 로그인 안했을때 */
                <>
                  <Link to="#" onClick={() => modalKlipAdd(true)}><i className="uil uil-sign-in-alt"></i> LOGIN</Link>
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
                  <Link to="#"><i className="uil uil-wallet"></i></Link>
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
              <li key={1}><i className="uil uil-coins"></i> {balance.toFixed(3)} CT</li>
              <li key={2}><i className="uil uil-times-circle"></i></li>
            </>
          }
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
            <dt>클레이스왑 시작하기</dt>
            <dd onClick={() => modalKlipAdd(false)}><i className="uil uil-times"></i></dd>
          </dl>
          <div>
            <h2>내 카카오톡으로 간편하고 안전하게 시작할 수 있습니다.</h2>
            <h3>
              <a href="#none" onClick={() => handleOpenKlipLogin()}><img src={iconKlip} alt="" title=""/>카카오톡으로 Klip 지갑 연결</a>
            </h3>
            <h4>
              <a href="#none">내 손안의 디지털 지갑, Klip 안내 <i className="uil uil-angle-right"></i></a>
            </h4>
            <dl>
              <dt></dt>
              <dd>또는</dd>
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
      <Modal open={openKlipLogin} onClose={() => modalKlipLogin(false)} center>
        <div className="base-modal KlipWeb2AppModal">
          <section className="gen-modal klip-with-qr-modal">
            <div className="gen-modal-close" onClick={() => modalKlipLogin(false)}></div>
            <div className="gen-modal-title">
              <img src="https://klayswap.com/img/icon/ic-service-klip-bk.svg" alt="klip" />
              <label>카카오 Klip QR 연결 </label>
            </div>
            
            <article className="klip-with-qr-modal__body">
              <div className="klip-with-qr-modal__code">
                <div className="klip-with-qr-modal__code__wrapper">
                  <div level="L" background="#fff" foreground="#000" className="">
                    
                    <img style={{width: '100%', height: '100%', top: '0px', left: '0px'}} src={qrImage} alt="pointer" />
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
      document.querySelector('.header > dl > dd > h2').style.color = '#222';
      document.querySelector('.header > dl > dd > h2 > span').style.color = '#222';
      document.querySelector('.header > dl > dd > div > a:nth-child(1)').style.color = '#222';
      document.querySelector('.header > dl > dd > div > a:nth-child(1)').style.background = '#edf3f8';
      document.querySelector('.header > dl > dd > div > a:nth-child(2)').style.color = '#222';
      document.querySelector('.header > dl > dd > div > a:nth-child(2)').style.background = '#edf3f8';
      document.querySelector('.header > dl > dd > div > a:nth-child(3)').style.color = '#222';
      document.querySelector('.header > dl > dd > div > a:nth-child(3)').style.background = '#edf3f8';
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
      document.querySelector('.header > dl > dd > div > a:nth-child(3)').style.color = '#fff';
      document.querySelector('.header > dl > dd > div > a:nth-child(3)').style.background = 'rgba(255,255,255,0.3)';
    }
  } catch(e) {
    // ignore
  }
}

window.addEventListener('scroll', resizeHeaderOnScroll);


export default Header;