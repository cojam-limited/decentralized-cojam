import React from 'react';
import { StyledButton } from './styles';

export default function Button({ text = '', onClick = () => {}, disabled = false }) {
  return (
    <StyledButton disabled={disabled} onClick={onClick}>
      {text}
    </StyledButton>
  );
}
