import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AddBoxIcon from '@mui/icons-material/AddBox';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { NavigationContainer } from './styles';

export default function Navigation() {
  const [value, setValue] = React.useState(0);

  return (
    <NavigationContainer>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
      >
        <BottomNavigationAction value={0} label={value === 0 ? 'Draw' : ''} icon={<RestaurantIcon />} />
        <BottomNavigationAction value={1} label={value === 1 ? 'Propose' : ''} icon={<AddBoxIcon />} />
        <BottomNavigationAction value={2} label={value === 2 ? 'Vote' : ''} icon={<HowToVoteIcon />} />
      </BottomNavigation>
    </NavigationContainer>
  );
}
