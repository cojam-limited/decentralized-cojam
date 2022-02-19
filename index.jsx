import React from 'react';
import ReactDOM from 'react-dom';
import Router from './router';

import { ThemeProvider } from '@mui/material';
import theme from './theme';

const App = () => {
  return (
    <div style={{ paddingBottom: '60px', height: '100%' }}>
      <ThemeProvider theme={theme}>
        <Router />
      </ThemeProvider>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
