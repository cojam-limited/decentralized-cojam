import React, { useState, useRef } from 'react';
import Drawer from '@mui/material/Drawer';
import CopyIcon from '@mui/icons-material/ContentCopy';
import Button from '@components/Button';
import { UserContainer, AccountCard, DrawerContents, ServiceContainer } from './styles';

import useDrawerData from '@data/drawer';

export default function SideDrawer() {
  const { drawerData, mutateDrawerData } = useDrawerData();
  const accountRef = useRef();
  const address = '0x9bf610E09D53F1A884BECaA43F94a04948285600';
  const balance = 15;
  const [walletConnection, setWalletConnection] = useState(false);

  const handleClose = () => {
    mutateDrawerData({ open: false });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(accountRef.current.value);
    window.alert('copied');
  };

  const handleConnectWallet = () => {
    setWalletConnection(!walletConnection);
  };

  return (
    <Drawer anchor="right" open={Boolean(drawerData.open)} onClose={handleClose}>
      <DrawerContents>
        <UserContainer>
          {address && (
            <AccountCard>
              <h1>Address</h1>
              <div className="address" onClick={handleCopy}>
                <span>{`${address.slice(0, 6)}...${address.slice(-6)}`}</span>
                <CopyIcon fontSize="smal" />
              </div>
              {/* copy to clipboard용 히든 필드 */}
              <input type="text" style={{ display: 'none' }} defaultValue={address} ref={accountRef} />
            </AccountCard>
          )}

          {address && (
            <AccountCard>
              <h1>Balacne</h1>
              <div className="address" onClick={handleCopy}>
                <span>{balance} KLAY</span>
              </div>
            </AccountCard>
          )}

          <Button text={walletConnection ? 'Disconnct Wallet' : 'Connect Wallet'} onClick={handleConnectWallet} />
        </UserContainer>

        <ServiceContainer>
          <li>About</li>
          <li>Terms of Service</li>
          <li>Privacy Policy</li>
        </ServiceContainer>
      </DrawerContents>
    </Drawer>
  );
}
