import React, { useState, useRef } from 'react';
import Carousel from '@components/Carousel';
import FoodCard from '@components/FoodCard';
import CopyIcon from '@mui/icons-material/ContentCopy';
import Button from '@components/Button';
import { Container, UserContainer, AccountCard, NFTContainer } from './styles';
import Pizza from '@assets/img_pizza.jpg';
import Burger from '@assets/img_burger.jpg';
import Salad from '@assets/img_salad.jpg';
import Chicken from '@assets/img_chicken.jpg';
import Sushi from '@assets/img_sushi.jpg';

import useDrawerData from '@data/drawer';
import { WALLET_MODAL_DATA_KEY, useModalData } from '@data/modal';
import toastNotify from '@utils/toast';

function User() {
  const { drawerData, mutateDrawerData } = useDrawerData();
  const { mutateModalData } = useModalData(WALLET_MODAL_DATA_KEY);
  const accountRef = useRef();
  const address = '0x9bf610E09D53F1A884BECaA43F94a04948285600';
  const balance = 15;
  const [walletConnection, setWalletConnection] = useState(false);

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
    mutateModalData({ open: true });
  };
  return (
    <Container>
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
            <h1>Balance</h1>
            <div className="address" onClick={handleCopy}>
              <span>{balance} KLAY</span>
            </div>
          </AccountCard>
        )}

        <Button text={walletConnection ? 'Disconnct Wallet' : 'Connect Wallet'} onClick={handleConnectWallet} />
      </UserContainer>

      <NFTContainer>
        <h1>My NFT Collection</h1>
        <Carousel>
          <FoodCard img={Pizza} title="Pizza" />
          <FoodCard img={Burger} title="Burger" />
          <FoodCard img={Salad} title="Salad" />
          <FoodCard img={Sushi} title="Sushi" />
          <FoodCard img={Chicken} title="Chicken" />
        </Carousel>
      </NFTContainer>
    </Container>
  );
}

export default User;
