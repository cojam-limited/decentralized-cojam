import React, { useState, useRef, useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import CopyIcon from '@mui/icons-material/ContentCopy';
import Button from '@components/Button';
import { UserContainer, AccountCard, DrawerContents, ServiceContainer } from './styles';

import useDrawerData from '@data/drawer';
import { WALLET_MODAL_DATA_KEY, useModalData } from '@data/modal';
import { useWalletData } from '@data/wallet';
import { kaikasLogin, kaikasGetBalance, isKaikasUnlocked } from '@api/UseKaikas';
import toastNotify from '@utils/toast';

export default function SideDrawer() {
  const { drawerData, mutateDrawerData } = useDrawerData();
  const { mutateModalData } = useModalData(WALLET_MODAL_DATA_KEY);
  const accountRef = useRef();
  const { walletData, mutateWalletData } = useWalletData();
  const [balance, setBalance] = useState(0);

  const handleClose = () => {
    mutateDrawerData({ open: false });
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

  useEffect(async () => {
    if (walletData?.account && drawerData?.open) {
      // 현재 walletData가 세션에 유자되어있고 Disconnect 안했는데 kaikas가 잠금 상태일 경우 kaikasLogin 호출
      const kaikasUnlocked = await isKaikasUnlocked();
      if (!kaikasUnlocked) {
        await kaikasLogin();
      }
      // drawer가 열고 닫힐 때 마다 balance 업데이트
      getBalance();
    }
  }, [walletData, drawerData]);

  useEffect(() => {
    //카이카스 설치된 경우
    if (window?.klaytn & walletData?.account && drawerData?.open) {
      window?.klaytn.on('networkChanged', function () {
        // 유저가 네트워크 변경했을 때 balance 업데이트
        getBalance();
      });
    }
  }, [drawerData]);

  return (
    <Drawer anchor="right" open={Boolean(drawerData.open)} onClose={handleClose}>
      <DrawerContents>
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

        {/* <ServiceContainer>
          <li>About</li>
          <li>Terms of Service</li>
          <li>Privacy Policy</li>
        </ServiceContainer> */}
      </DrawerContents>
    </Drawer>
  );
}
