import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navigation from '@components/Navigation';
import Drawer from '@components/Drawer';
import WalletModal from '@components/WalletModal';
import KlipQRModal from '@components/KlipQRModal';
import Header from '@components/Header';

const Home = React.lazy(() => import('@pages/Home'));
const RandomDraw = React.lazy(() => import('@pages/RandomDraw'));
const Landing = React.lazy(() => import('@pages/Landing'));
const NotFound = React.lazy(() => import('@pages/NotFound'));

const Router = () => {
  return (
    <BrowserRouter>
      <Header />
      <Suspense fallback={<p> Loading...</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/randomdraw" element={<RandomDraw />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Navigation />
      <Drawer />
      <WalletModal />
      <KlipQRModal />
    </BrowserRouter>
  );
};

export default Router;
