import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Router from './router';

import { useWalletData } from '@data/wallet';
import { BalanceProvider } from './components/Context/BalanceContext';
import { QrProvider } from './components/Context/QrContext';
import { CookiesProvider } from 'react-cookie';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';

import './assets/css/style.css'
import './assets/css/default.css'

const POLLING_INTERVAL = 12000;
export const getLibrary = provider => {
  const library = new ethers.providers.Web3Provider(provider);
  library.pollingInterval = POLLING_INTERVAL;
  return library;
};

const App = () => {
  const [needNftModal, setNeedNftModal] = useState(false);
  const [toggleMyPage, setToggleMyPage] = useState(false);

  return (
    <div
      style={{
        paddingBottom: '53px',
        height: 'auto' }}
    >
      <Router
        toggleMyPage={toggleMyPage}
        setToggleMyPage={setToggleMyPage}
        needNftModal={needNftModal}
        setNeedNftModal={setNeedNftModal} />
    </div>
  );
};

ReactDOM.render(
  <Web3ReactProvider getLibrary={getLibrary}>
    <QrProvider>
      <BalanceProvider> 
        <CookiesProvider>
          <App /> 
        </CookiesProvider>
      </BalanceProvider>
    </QrProvider>
  </Web3ReactProvider>,
  document.getElementById('root')
);
