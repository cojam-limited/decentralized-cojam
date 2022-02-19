import React, { useState } from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AddIcon from '@mui/icons-material/AddBox';
import VoteIcon from '@mui/icons-material/HowToVote';
import AccountIcon from '@mui/icons-material/AccountCircleOutlined';
import { NavigationContainer } from './styles';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Navigation() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [value, setValue] = useState(0);
  const handleClickNav = (loaction) => () => {
    navigate(loaction);
  };

  return (
    <NavigationContainer>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
      >
        <BottomNavigationAction onClick={handleClickNav('/')} label={value === 0 ? 'Home' : ''} icon={<HomeIcon />} />
        <BottomNavigationAction
          onClick={handleClickNav('/draw')}
          label={value === 1 ? 'Draw' : ''}
          icon={<RestaurantIcon />}
        />
        <BottomNavigationAction
          onClick={handleClickNav('/propose')}
          label={value === 2 ? 'Propose' : ''}
          icon={<AddIcon />}
        />
        <BottomNavigationAction
          onClick={handleClickNav('/vote')}
          label={value === 3 ? 'Vote' : ''}
          icon={<VoteIcon />}
        />
        <BottomNavigationAction
          onClick={handleClickNav('/user')}
          label={value === 4 ? 'My' : ''}
          icon={<AccountIcon />}
        />
      </BottomNavigation>
    </NavigationContainer>
  );
}
