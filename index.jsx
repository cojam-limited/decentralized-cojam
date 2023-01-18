import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Router from './router';

import { useWalletData } from '@data/wallet';
import { BalanceProvider } from './components/Context/BalanceContext';
import { QrProvider } from './components/Context/QrContext';
import { CookiesProvider } from 'react-cookie';

import './assets/css/style.css'
import './assets/css/default.css'

const App = () => {
  const [needNftModal, setNeedNftModal] = useState(false);
  const [toggleMyPage, setToggleMyPage] = useState(false);
  const path = window.location.pathname;
  const pathCheck = path.split('/').length;
  return (
    <div
      style={{
        paddingBottom: pathCheck < 4 ? '53px' : '0',
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
  <QrProvider>
    <BalanceProvider> 
      <CookiesProvider>
        <App /> 
      </CookiesProvider>
    </BalanceProvider>
  </QrProvider>,
  document.getElementById('root')
);
