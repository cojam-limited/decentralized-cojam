import React from 'react';

import Layout from "../layouts/layout";

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import 'react-toastify/dist/ReactToastify.css';

import Home from '../pages/main/index'
import QuestList from '../pages/quest/list'
import QuestView from '../pages/quest/view'
import ResultsList from '../pages/results/list'
import ResultsView from '../pages/results/view'
import About from '../pages/about/about'
import CommunityList from '../pages/community/list'
import CommunityView from '../pages/community/view'
import Mypage from '../pages/mypage/mypage'

const Routers = () => {
  return (
    <Router>
      <Switch>
        <Route>
          <Layout>
            <Switch>
              <Route path='/' exact component={Home} />
              <Route path='/QuestList' exact component={QuestList} />
              <Route path='/QuestView' exact component={QuestView} />
              <Route path='/ResultsList' exact component={ResultsList} />
              <Route path='/ResultsView' exact component={ResultsView} />
              <Route path='/About' exact component={About} />
              <Route path='/CommunityList' exact component={CommunityList} />
              <Route path='/CommunityView' exact component={CommunityView} />
              <Route path='/Mypage' exact component={Mypage} />
            </Switch>
          </Layout>
        </Route>
      </Switch>
    </Router>
  );
};

/*
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
*/

export default Routers;
