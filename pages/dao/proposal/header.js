import React from 'react'
import { Icon } from '@iconify/react';
import { useHistory } from 'react-router-dom'

const header = ({toggleMyPage, setToggleMyPage}) => {
  const path = location.pathname;
  const title = path.split('/')[2];
  const getSession = sessionStorage?.getItem('data/wallet')?.replace(/[{}]/g, '');
  const account = getSession?.split(',')[0]?.split(':')[1]?.replace(/["]/g, '');
  const history = useHistory();

  const goToHomeHandler = () => {
    history.push('/Dao/DaoList');
  }
  const OpenMyPageHandler = () => {
    if (toggleMyPage === false) {
      setToggleMyPage(true);
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
          <p onClick={OpenMyPageHandler}>{account}</p>
        </div>
        <h2>{title}</h2>
      </div>
    </div>
  )
}

export default header