import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom'
import { Modal } from 'react-responsive-modal';
import LogoWhite from '@assets/logo_white.png'
import LogoBlack from '@assets/logo_black.png'

import iconKlip from '@assets//icon_klip.svg'
import iconMetamask from '@assets/icon_metamask.svg'
import Logo_Kaikas from '@assets/logo_kaikas.svg';

import { ConnectKaikasButton } from './styles';
import isMobile from '@utils/isMobile';
import { KLIP_MODAL_DATA_KEY, WALLET_MODAL_DATA_KEY, useModalData } from '@data/modal';
import { kaikasLogin, transferFromCojamURI, isKaikasUnlocked, getCojamBalance } from '@api/UseKaikas';
import Moment, { now } from 'moment';
import { useWalletData } from '@data/wallet';
import toastNotify from '@utils/toast';

import { client } from "../sanity";

function Header() {
  const history = useHistory()
  const [openKlipAdd, modalKlipAdd] = useState(false);
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

  const checkWalletConnection = async () => {
    let result = true;
    const kaikasUnlocked = await isKaikasUnlocked();

    console.log('is lock?', !kaikasUnlocked);
    if(!kaikasUnlocked) {
      mutateWalletData({ account: '' });
      return false;
    }

    if (!walletData?.account || walletData?.account === '') {
      result = false;
    }

    return result;
  };

  const handleClose = () => {
    mutateModalData({ open: false });
  };

  const handleOpenKaikasModal = async () => {
    const kaikasUnlocked = await isKaikasUnlocked();
    if (!kaikasUnlocked) {
      const account = await kaikasLogin();
      mutateWalletData({ account: account });
      mutateModalData({ open: false });
      modalKlipAdd(false);
    } 

    /*
    if (!isMobile()) {
      const kaikasUnlocked = await isKaikasUnlocked();
      if (!kaikasUnlocked) {
        const account = await kaikasLogin();
        mutateWalletData({ account: account });
        mutateModalData({ open: false });
        modalKlipAdd(false);
      }
    } else {
      toastNotify({
        state: 'error',
        message: 'Not Support MoblieWeb.',
      });
    }
    */
  }

  const getjoinReward = () => {
		const walletAddress = walletData.account;

		if(walletAddress) {
			const joinRewardHistQuery = `*[_type == 'joinRewardHistory' && walletAddress == '${walletAddress}'][0]`;
			client.fetch(joinRewardHistQuery).then((joinRewardHistory) => {
				console.log('joinRewardHistory', joinRewardHistory);

				if(joinRewardHistory) {
					alert("you've got reward already.");
				} else {
					const rewardInfoQuery = `*[_type == 'rewardInfo' && isActive == true && rewardType == 'join'][0]`;
					client.fetch(rewardInfoQuery).then(async (rewardInfo) => {
						console.log('reward amount', rewardInfo.amount);

            if(!rewardInfo.amount) {
              alert('join reward amount is not exist');
              return;
            }

						// send coin from master wallet
						let transferRes;
						try {
              const cojamRecommendAddress = '0xd3b63ca1215a9f13d38e3a782672cda6ae098e40';
							transferRes = await transferCojamURI({fromAddress: cojamRecommendAddress, toAddress: walletAddress, amount: Number(rewardInfo.amount)});
						} catch(error) {
              console.log(error);

							//ignore
							alert('transfer api error. try again.');
							return;
						}

						console.log('transfer complete');

						if(transferRes.status) {
							// remain transfer history

							const joinRewardHistoryDoc = {
								_type: 'joinRewardHistory',
								walletAddress: walletAddress,
								rewardAmount: Number(rewardInfo.amount),
								transactionId: transferRes.transactionId,
								createDateTime: Moment(now()).format("yyyy-MM-DD HH:mm:ss")
							}

							client.create(joinRewardHistoryDoc).then((res) => {
								console.log('join reward hist create result', res);
							});

              alert('get join reward successfully');

							const cojamTokenAddress = '0xd6cdab407f47afaa8800af5006061db8dc92aae7';   // my cojam token address - Test 2
							const transactionSet = {
								_type: 'transactions',
								amount: Number(rewardInfo.amount),
								recipientAddress: walletAddress,
								spenderAddress: cojamTokenAddress,
								status: 'SUCCESS',
								transactionId: transferRes.transactionId,
								transactionType: 'JOIN_REWARD',
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

  // login 에 따라 wallet, balance 상태 관리
  useEffect(() => {
    console.log('header', walletData);

    getBalance();

    if(walletData && walletData.account) {
      const memberQuery = `*[_type == 'member' && walletAddress == '${walletData.account}'][0] {memberRole}`;
      client.fetch(memberQuery).then((memberRole) => {
        if(memberRole) {
          setMemberRole(memberRole.memberRole);
        }
      });

      // if new user then, add member info & give a join reward - start
      const getMemberQuery = `*[_type == 'member' && walletAddress == '${walletData.account}'][0]`;
      client.fetch(getMemberQuery).then((member) => {
        console.log('member exist ?? ', member);

        if(!member) {
          alert('Welcome to the Cojam. Take a join reward.');

          // send join reward to user
          getjoinReward();
        }
      })

      const memberDoc = {
        _type: 'member',
        _id: walletData.account,
        memberName: walletData.account,
        walletAddress: walletData.account,
        createdDateTime: Moment(now()).format('yyyy-MM-DD HH:mm:ss')
      }

      client.createIfNotExists(memberDoc).then((res) => {
        console.log('member create result', res);
      });

      // if new user then, add member info & give a join reward - end
    } else {
      setMemberRole('');
    }

  }, [walletData, walletData.account]);

  useEffect(() => {
    //console.log('balance reset', checkWalletConnection());

    checkWalletConnection().then((res) => {
      console.log('balance reset', res);
      setIsLogin(res);
    });

    //setIsLogin(checkWalletConnection());
  }, [balance]);

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
              isLogin
              ? /* 로그인 했을때 */
                <>
                  <h2><i className="uil uil-user-circle"></i> <span>({balance ? (Number.isInteger(balance) ? balance : balance.toFixed(8)) : 0} CT,  {walletData.account?.substring(0, 10) + '...'})</span></h2>
                  <div>
                    <Link to="/Mypage"><i className="uil uil-user-circle"></i> MYPAGE</Link>
                    {memberRole?.toLowerCase === 'admin' && <Link to="/Market"><i className="uil uil-user-circle"></i> ADMIN</Link>}
                    {/*<Link to="/Account"><i className="uil uil-user-circle"></i> ACCOUNT</Link>*/}
                    {/*<Link to="#" onClick={() => { handleConnectWallet() }}><i className="uil uil-sign-out-alt"></i>LOGOUT</Link> */}
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
              isLogin
              ? /* 로그인 했을때 */
                <> 
                  <Link to="#"><i className="uil uil-wallet"></i></Link>
                  <Link to="/Mypage"><i className="uil uil-user-circle"></i></Link>
                  {memberRole?.toLowerCase === 'admin' && <Link to="/Market"><i className="uil uil-user-circle"></i> ADMIN</Link>}
                  {/*<Link to="/Market"><i className="uil uil-sign-out-alt"></i>LOGOUT</Link>*/}
                </>
              : /* 로그인 안했을때 */
                <>
                  <Link to="#" onClick={() => modalKlipAdd(true)}><i className="uil uil-sign-in-alt"></i> LOGIN</Link>
                </> 
            }
          </dd>
        </dl>
        <ul>
          <li><i className="uil uil-coins"></i> {balance !== -1 ? balance.toFixed(3) : 0} CT</li>
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
            <dt>클레이스왑 시작하기</dt>
            <dd onClick={() => modalKlipAdd(false)}><i className="uil uil-times"></i></dd>
          </dl>
          <div>
            <h2>내 카카오톡으로 간편하고 안전하게 시작할 수 있습니다.</h2>
            <h3>
              <a href="#none"><img src={iconKlip} alt="" title="" />카카오톡으로 Klip 지갑 연결</a>
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
    </div>
  );
}


function resizeHeaderOnScroll() {
  const distanceY = window.scrollY || document.body.scrollTop,
  shrinkOn = 50
  //header = document.getElementById('header');

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