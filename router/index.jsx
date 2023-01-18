import React, { useState } from 'react';

import Layout from "../layouts/layout";

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import { ToastContainer } from 'react-toastify';
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
import Dao from '../pages/dao/dao'
import DaoList from '../pages/dao/list/list'
import DaoView from '../pages/dao/view/view'
import DaoProposal from '../pages/dao/proposal/proposal'
import DaoProposalView from '../pages/dao/proposal/view'
import DaoProposalCreate from '../pages/dao/proposal/create'
import DaoVotingHistory from '../pages/dao/votinghistory/list'
import DaoRewardHistory from '../pages/dao/rewardhistory/list'

const Routers = ({ needNftModal, setNeedNftModal, toggleMyPage, setToggleMyPage }) => {
  return (
    <Router>
      <Switch>
        <Route>
          <Layout
            toggleMyPage={toggleMyPage}
            setToggleMyPage={setToggleMyPage}
            needNftModal={needNftModal}
            setNeedNftModal={setNeedNftModal}>
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
              <Route path='/Dao' exact component={Dao} />
              <Route path='/Dao/DaoList' exact component={DaoList}></Route>
              <Route path='/Dao/DaoView' exact component={DaoView}></Route>
              <Route path='/Dao/DaoProposals' exact component={DaoProposal}></Route>
              <Route path='/Dao/DaoProposals/View' exact component={DaoProposalView}></Route>
              <Route path='/Dao/DaoProposals/Create' exact render={() => <DaoProposalCreate needNftModal={needNftModal} setNeedNftModal={setNeedNftModal} />} />
              <Route path='/Dao/VotingHistory' exact component={DaoVotingHistory}></Route>
              <Route path='/Dao/RewardHistory' exact component={DaoRewardHistory}></Route>
            </Switch>

            <ToastContainer />
          </Layout>
        </Route>
      </Switch>
    </Router>
  );
};

export default Routers;
