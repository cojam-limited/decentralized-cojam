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
import Market from '../pages/market/market'
import Account from '../pages/account/account'

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
              <Route path='/Market' exact component={Market} />
              <Route path='/Account' exact component={Account} />
            </Switch>
          </Layout>
        </Route>
      </Switch>
    </Router>
  );
};

export default Routers;
