import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const Home = React.lazy(() => import('@pages/Home'));
const NotFound = React.lazy(() => import('@pages/NotFound'));

const Router = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<p> Loading...</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default Router;
