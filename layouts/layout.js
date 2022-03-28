import React, { useState } from 'react';

import Header from "./header";
import Footer from "./footer";

import LoadingContext from "../assets/context/LoadingContext";
import LoadingOverlay from "../components/LoadingOverlay";

const Layout = ({ children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <LoadingContext loading={loading} setLoading={setLoading}>
         {loading && <LoadingOverlay />}
      <Header />
        {children}
      <Footer />
      </LoadingContext>
    </div>
  )
}

// eslint-disable-next-line import/no-anonymous-default-export
export default Layout;