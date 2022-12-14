import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import Router from './router';

import { useWalletData } from '@data/wallet';
import { BalanceProvider } from './components/Context/BalanceContext';
import { QrProvider } from './components/Context/QrContext';
import { CookiesProvider } from 'react-cookie';

import './assets/css/style.css'
import './assets/css/default.css'

const App = () => {
  return (
    <div style={{ paddingBottom: '60px', height: 'auto' }}>
        <Router />
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
