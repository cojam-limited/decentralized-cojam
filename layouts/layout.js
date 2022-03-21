import React from 'react';

import Header from "./header";
import Footer from "./footer";

const Layout = ({ children }) => {
  return (
    <>
      <Header />
        {children}
      <Footer />
    </>
  )
}

// eslint-disable-next-line import/no-anonymous-default-export
export default Layout;