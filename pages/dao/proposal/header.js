import React from 'react'
import { Icon } from '@iconify/react';
import { useHistory } from 'react-router-dom'

const header = () => {
  const path = location.pathname;
  const titleArray = path.split('/')[2];
  const title = titleArray.includes('Proposals') ? 'Proposals' : '';
  const getSession = sessionStorage?.getItem('data/wallet')?.replace(/[{}]/g, '');
  const account = getSession?.split(',')[0]?.split(':')[1]?.replace(/["]/g, '');
  const history = useHistory();

  const goToHomeHandler = () => {
    if(location.pathname === '/Dao/DaoProposals') {
      history.push('/Dao/DaoList');
    } else {
      history.push('/Dao/DaoProposals')
    }
  }

  return (
    <div className='proposal-header'>
      <div>
        <Icon
          icon="material-symbols:keyboard-arrow-left"
          className='arrow'
          onClick={goToHomeHandler}
        />
        <div className='account'>
          <p>{account}</p>
        </div>
        <h2>{title}</h2>
      </div>
    </div>
  )
}

export default header