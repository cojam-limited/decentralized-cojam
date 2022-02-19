import React from 'react';
import ReactDOM from 'react-dom';
import Router from './router';

import { ThemeProvider } from '@mui/material';
import theme from './theme';

const App = () => {
  return (
    <>
      <ThemeProvider theme={theme}>
        <Router />
      </ThemeProvider>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
