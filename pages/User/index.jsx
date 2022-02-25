import React, { useState, useEffect, useRef } from 'react';
import Carousel from '@components/Carousel';
import FoodCard from '@components/FoodCard';
import CopyIcon from '@mui/icons-material/ContentCopy';
import Button from '@components/Button';
import { Container, UserContainer, AccountCard, NFTContainer } from './styles';

import { WALLET_MODAL_DATA_KEY, useModalData } from '@data/modal';
import toastNotify from '@utils/toast';
import { ownNftList } from '@api/UseKAS';
import { kaikasLogin, kaikasGetBalance, isKaikasUnlocked } from '@api/UseKaikas';
import { useWalletData } from '@data/wallet';

function User() {
  const { mutateModalData } = useModalData(WALLET_MODAL_DATA_KEY);
  const accountRef = useRef();
  const [userNftList, setUserNftList] = useState([]);
  const { walletData, mutateWalletData } = useWalletData();
  const [balance, setBalance] = useState(0);

  const getUserNftList = async () => {
    try {
      if (walletData?.account) {
        const list = await ownNftList(walletData.account);
        setUserNftList(list);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(accountRef.current.value);
    toastNotify({
      state: 'success',
      message: 'copied.',
    });
  };

  const handleConnectWallet = () => {
    if (walletData?.account) {
      //Disconnect wallet
      mutateWalletData({ account: '' });
      toastNotify({
        state: 'success',
        message: 'Disconnected.',
      });
    } else {
      //Connect wallet
      mutateModalData({ open: true });
    }
  };

  const getBalance = async () => {
    if (walletData?.account) {
      const balance = await kaikasGetBalance(walletData.account);
      setBalance(balance / 10 ** 18);
    }
  };

  useEffect(() => {
    getUserNftList();
  }, []);

  useEffect(async () => {
    if (walletData?.account) {
      // 현재 walletData가 세션에 유자되어있고 Disconnect 안했는데 kaikas가 잠금 상태일 경우 kaikasLogin 호출
      const kaikasUnlocked = await isKaikasUnlocked();
      if (!kaikasUnlocked) {
        await kaikasLogin();
      }
      // user페이지 열릴 때 마다 balance 업데이트
      getBalance();
    }
  }, [walletData]);

  useEffect(() => {
    //카이카스 설치된 경우
    if (window?.klaytn && walletData?.account) {
      window?.klaytn.on('networkChanged', function () {
        // 유저가 네트워크 변경했을 때 balance 업데이트
        getBalance();
      });
    }
  }, []);

  return (
    <Container>
      <UserContainer>
        <AccountCard>
          <h1>Address</h1>
          <div className="address" onClick={handleCopy}>
            {walletData?.account ? (
              <>
                <span>{`${walletData.account.slice(0, 6)}...${walletData.account.slice(-6)}`}</span>
                <CopyIcon fontSize="smal" />
              </>
            ) : (
              'Please connect wallet'
            )}
          </div>
          {/* copy to clipboard용 히든 필드 */}
          <input type="text" style={{ display: 'none' }} defaultValue={walletData?.account} ref={accountRef} />
        </AccountCard>

        <AccountCard>
          <h1>Balance</h1>
          <div className="address" onClick={handleCopy}>
            {walletData?.account ? <span>{balance} KLAY</span> : 'Please connect wallet'}
          </div>
        </AccountCard>

        <Button text={walletData?.account ? 'Disconnect Wallet' : 'Connect Wallet'} onClick={handleConnectWallet} />
      </UserContainer>

      <NFTContainer>
        <h1>My NFT Collection</h1>
        {!userNftList?.length ? (
          <div>There is no NFT</div>
        ) : (
          <Carousel>
            {userNftList.map((item) => (
              <FoodCard key={item.imageUri} img={item.imageUri} title={item.menuType} />
            ))}
          </Carousel>
        )}
      </NFTContainer>
    </Container>
  );
}

export default User;
