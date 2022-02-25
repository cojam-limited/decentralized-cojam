import React, { Suspense } from 'react';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Navigation from '@components/Navigation';
import Drawer from '@components/Drawer';
import WalletModal from '@components/WalletModal';
import KlipQRModal from '@components/KlipQRModal';
import VoteModal from '@components/VoteModal';
import UploadImageModal from '@components/UploadImageModal';
import Header from '@components/Header';
import Loading from '@components/Loading';
import 'react-toastify/dist/ReactToastify.css';

const Home = React.lazy(() => import('@pages/Home'));
const RandomDraw = React.lazy(() => import('@pages/RandomDraw'));
const ProposeMenu = React.lazy(() => import('@pages/ProposeMenu'));
const Vote = React.lazy(() => import('@pages/Vote'));
const User = React.lazy(() => import('@pages/User'));
const NotFound = React.lazy(() => import('@pages/NotFound'));

const Router = () => {
  return (
    <BrowserRouter>
      <Header />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/randomdraw" element={<RandomDraw />} />
          <Route path="/propose" element={<ProposeMenu />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/user" element={<User />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Navigation />
      <Drawer />
      <WalletModal />
      <KlipQRModal />
      <VoteModal />
      <UploadImageModal />
      <ToastContainer />
    </BrowserRouter>
  );
};

export default Router;
