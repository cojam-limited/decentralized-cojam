import React from 'react';
import { StyledButton } from './styles';

export default function Button({ text, onClick }) {
  return <StyledButton onClick={onClick}>{text}</StyledButton>;
}
