import React from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import Logo from '@assets/logo.png';
import { StyledHeader, LogoContainer } from './styles';

import useDrawerData from '@data/drawer';

export default function Header() {
  const { mutateDrawerData } = useDrawerData();
  const handleOpen = () => {
    mutateDrawerData({ open: true });
  };
  return (
    <StyledHeader>
      <LogoContainer>
        <img src={Logo} alt="Badgemeal" />
        <h1>BadgeMeal</h1>
      </LogoContainer>
      <MenuIcon onClick={handleOpen} />
    </StyledHeader>
  );
}
