import React from 'react';
import ReactDOM from 'react-dom';
import Router from './router';

import Navigation from '@components/Navigation';
import { ThemeProvider } from '@mui/material';
import theme from './theme';

const App = () => {
  return (
    <>
      <ThemeProvider theme={theme}>
        <Router />
        <Navigation />
      </ThemeProvider>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
