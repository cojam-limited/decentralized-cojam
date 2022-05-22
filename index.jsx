import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import Router from './router';

import { useWalletData } from '@data/wallet';
import toastNotify from '@utils/toast';

import './assets/css/style.css'

const App = () => {
  const { walletData, mutateWalletData } = useWalletData();

  useEffect(() => {
    //카이카스 설치된 경우
    if (window?.klaytn) {
      window?.klaytn.on('accountsChanged', function (accounts) {
        //console.log('account change', accounts);
        // 카이카스에서 계정 전환했을 때 지갑 주소 업데이트
        if( walletData.type === 'kaikas' || walletData.account === '' ) {
          mutateWalletData({ account: accounts[0] });
        }
      });

      window?.klaytn.on('networkChanged', function () {
        // 유저가 네트워크 변경했을 때 지갑 업데이트
        toastNotify({
          state: 'warn',
          message: 'network Changed.',
        });
      });
    } else {
      //카이카스 설치 안된 경우
      console.error('There is No Kaikas');
    }
  }, []);

  return (
    <div style={{ paddingBottom: '60px', height: 'auto' }}>
        <Router />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
