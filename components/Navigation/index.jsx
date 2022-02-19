import React, { useEffect, useState } from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AddIcon from '@mui/icons-material/AddBox';
import VoteIcon from '@mui/icons-material/HowToVote';
import AccountIcon from '@mui/icons-material/AccountCircle';
import { NavigationContainer } from './styles';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Navigation() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [value, setValue] = useState(pathname.replace('/', ''));
  const handleClickNav = (location) => () => {
    navigate(location);
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
        <BottomNavigationAction
          onClick={handleClickNav('/')}
          label={value === '' ? 'Home' : ''}
          icon={<HomeIcon />}
          value=""
        />
        <BottomNavigationAction
          onClick={handleClickNav('/randomdraw')}
          label={value === 'randomdraw' ? 'Draw' : ''}
          icon={<RestaurantIcon />}
          value="randomdraw"
        />
        <BottomNavigationAction
          onClick={handleClickNav('/propose')}
          label={value === 'propose' ? 'Propose' : ''}
          icon={<AddIcon />}
          value="propose"
        />
        <BottomNavigationAction
          onClick={handleClickNav('/vote')}
          label={value === 'vote' ? 'Vote' : ''}
          icon={<VoteIcon />}
          value="vote"
        />
        <BottomNavigationAction
          onClick={handleClickNav('/user')}
          label={value === 'user' ? 'My' : ''}
          icon={<AccountIcon />}
          value="user"
        />
      </BottomNavigation>
    </NavigationContainer>
  );
}
