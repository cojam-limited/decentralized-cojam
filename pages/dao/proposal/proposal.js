import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";

import { useLoadingState } from "@assets/context/LoadingContext";

import { Proposal } from '../../../studio/src/actions/proposalActions'
import { client } from "../../../sanity";
import { setProposal } from '../../../api/UseWeb3';
import { lastElementsForPage } from "../../../studio/src/maker"
import toastNotify from '@utils/toast';

function Index() {
  const { loading, setLoading } = useLoadingState();
  const history = useHistory();
  
  const [ activeCategory, setActiveCategory ] = useState('All');
  const [ data, setData ] = useState([]);
  const [ newAccount, setNewAccount ] = useState(window?.klaytn?.selectedAddress?.toLowerCase());
  const [ nowTime, setNowTime ] = useState(new Date());
  const [ notData, setNotData ] = useState(false);
  const [ render, setRender ] = useState(false);
  const amdinContractAddress = '0x867385AcD7171A18CBd6CB1ddc4dc1c80ba5fD52';
  useEffect(async () => {
    setInterval(() => {
      setNowTime(new Date())
    }, 1000)
  }, [])
  window.klaytn.on('accountsChanged', (accounts) => {
    setNewAccount(accounts[0]);
  });

  const categories = [
    {status: 'All'},
    {status: 'Active'},
    {status: 'Closed'}
  ]

  useEffect(async () => {
    setLoading(true);
    if(activeCategory === 'All') {
      const data = await Proposal.listAll()
      setNotData(false);
      setData(data);
    } else if(activeCategory === 'Active') {
      const data = await Proposal.listOpen()
      setNotData(false);
      setData(data);
    } else if(activeCategory === 'Closed') {
      const data = await Proposal.listClosed()
      setNotData(false);
      setData(data);
    }
    setLoading(false);
  }, [activeCategory, render])

  const clickHandler = async (list, diff, totalAmount, resultVote) => {
    const accounts = await window.klaytn.enable();
    const account = accounts[0]
    setNewAccount(account);

    if(diff < 0 && amdinContractAddress.toLowerCase() === account.toLowerCase() && list.proposalTxHash === null) {
      setLoading(true)
      const finalTitle = resultVote[0].option
      const finalVote = resultVote[0].total
      try {
        let endTime = Date.parse(list.endTime)
        let data;
        if(resultVote.length === 1) {
          data = {
            proposalKey: list.proposalKey,
            title: list.title,
            result: finalTitle,
            totalVote: totalAmount,
            resultVote: finalVote,
            endTime: endTime,
          }
        } else {
          data = {
            proposalKey: list.proposalKey,
            title: list.title,
            result: 'draw',
            totalVote: totalAmount,
            resultVote: finalVote,
            endTime: endTime,
          }
        }
        console.log(data);
        const result = await setProposal(data)
        await client.patch(list._id).set({proposalTxHash: result.transactionHash}).commit();
        setRender(!render)
        setLoading(false)
        toastNotify({
          state: 'success',
          message: 'Success Finish Result.',
        });
        return;
      } catch (err) {
        console.error(err)
        return;
      }
    }

    history.push({
      pathname: `/Dao/DaoProposals/View`,
      state: {
        proposalId: list.proposalKey,
        diff: diff
      }
    })
  }

  const goToCreateProposal = () => {
    history.push('/Dao/DaoProposals/Create')
  }

  const obsRef = useRef(null) // observer Element
  const [page, setPage] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(obsHandler, { threshold: 0.6 });
    if (obsRef.current) observer.observe(obsRef.current);
    return () => {
      observer.disconnect();
    }
  }, []);

  const obsHandler = async (entries) => {
    const target = entries[0];
    if (target.isIntersecting) {
      setPage(prev => prev + 1);
    }
  }

  const getQuestList = async () => {
    setLoading(true)
    if(activeCategory === 'All') {
      const {lastValue, lastId} = lastElementsForPage(data, '_createdAt')
      if(lastValue !== null && lastId !== null) {
        const loadingList = await Proposal.listAllPaged(lastValue, lastId)
        if(loadingList.length === 0) {
          setNotData(true);
          setLoading(false);
          return;
        }
        setData(prev => {
          return [...prev, ...loadingList]
        })
      }
    }

    if(activeCategory === 'Active') {
      const {lastValue, lastId} = lastElementsForPage(data, 'endTime')
      if(lastValue !== null && lastId !== null) {
        const loadingList = await Proposal.listOpenPaged(lastValue, lastId)
        if(loadingList.length === 0) {
          setNotData(true);
          setLoading(false);
          return;
        }
        setData(prev => {
          return [...prev, ...loadingList]
        })
      }
    }

    if(activeCategory === 'Closed') {
      const {lastValue, lastId} = lastElementsForPage(data, '_createdAt')
      if(lastValue !== null && lastId !== null) {
        const loadingList = await Proposal.listClosedPaged(lastValue, lastId)
        if(loadingList.length === 0) {
          setNotData(true);
          setLoading(false);
          return;
        }
        setData(prev => {
          return [...prev, ...loadingList]
        })
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    if(!notData && data.length !== 0) {
      getQuestList()
    }
  }, [page])

  const totalCount = data.length;

  return (
  <div className="bg-quest">
      <div className="dao-container proposal">
        {/* 카테고리 영역 */}
        <div className="dao-proposal-section">
          <p>Total <span>{totalCount}</span></p>
          <select
            style={{
              backgroundImage: 'url("../../../assets/caret-down-light.svg")'
            }}
            onChange={(e) => {setActiveCategory(e.target.value)}}
          >
            {
              categories && categories.map((category, index) => (
                <option value={category.status} key={index}>{category.status}</option>
              ))
            }								
          </select>
        </div>
        {/* 카테고리 영역 끝 */}

        {/* 리스트 시작 */}
        <div className="dao-proposal-list">
          {/* Proposal 리스트 루프 Start */}
          <ul className="paginationContent">
            {
              loading && data.length === 0 ? (
                <div className='wait-list'>
                  <h2>Wait Loading List...</h2>
                </div>
              ) : null
            }
            {
              !loading && data.length === 0 ? (
                <div className='not-list-data'>
                  <h2>
                    No {activeCategory} Proposals Exist.
                  </h2>
                </div>
              ) : (null)
            }
            <ul className='dao-proposal-content'>
              {
                data.map((list, idx) => {
                  const endTime = new Date(list.endTime);
                  const diff = endTime - nowTime;

                  const diffDay = Math.floor(diff / (1000*60*60*24));
                  const diffHour = Math.floor((diff / (1000*60*60)) % 24);
                  const diffMin = Math.floor((diff / (1000*60)) % 60);
                  const diffSec = Math.floor(diff / 1000 % 60);

                  const totalAmount = list?.options?.reduce((acc, cur) => {
                    return acc + cur.total;
                  }, 0)
                  const resultVote = list?.options?.filter((votes, idx, target) => {
                    const maxOfVote = Math.max(...target.map(vote => vote.total));
                    return votes.total === maxOfVote;
                  })

                  return (
                    <li key={idx} onClick={() => clickHandler(list, diff, totalAmount, resultVote)}>
                      <div>
                        <h3>
                          {list?.creator?.slice(0, 6) + '...' + list?.creator?.slice(-4)}
                        </h3>
                        <div>
                          {
                            list.proposalTxHash ? (
                              <p className='finish'>
                                Finish
                              </p>
                            ) : (null)
                          }
                          <p className={`${diff > 0 ? 'active' : 'closed'}`}>
                            {diff > 0 ? 'Active' : 'Closed'}
                          </p>
                        </div>
                      </div>
                      <h2>{list?.title}</h2>
                      <p>{list?.description}</p>
                        {
                          diff > 0 ?
                          (
                            diffDay !== 0 ? (
                              <p>{diffDay} day left</p>
                            ) :
                            diffHour !== 0 ? (
                              <p>{diffHour} hour left</p>
                            ) : 
                            diffMin !== 0 ? (
                              <p>{diffMin} minute left</p>
                            ) : (
                              <p>{diffSec} second left</p>
                            )
                          )
                          :
                          (
                            <ul>
                              {
                                list.options.map(
                                  (val, idx) => {
                                    const percent = !isFinite(val.total / totalAmount) ? '0' : ((val.total / totalAmount) * 100).toFixed(2);
                                    return (
                                      <li
                                        key={idx}
                                        className={
                                          resultVote.length === 1 && resultVote[0] === val ? 'winnerAnswer' :
                                          resultVote.length > 1 ? 'drawAnswer' : ''
                                        }
                                      >
                                        <p>{val.option}</p>
                                        <p>{addComma(val.total)}({percent}%)</p>
                                      </li>
                                    )
                                  }
                                )
                              }
                            </ul>
                          )
                        }
                      </li>
                    )
                  }
                  )
                }
            </ul>
          {/* Proposal 리스트 루프 End */}
          </ul>
        </div>
        {/* 리스트 끝 */}
        {/* Proposal-footer Start */}
        <div
          className='proposal-footer'
          onClick={goToCreateProposal}
        >
          <p>Create Proposal</p>
        </div>
        {/* Proposal-footer End */}
      </div>
      <div ref={obsRef}></div>
    </div>
  )
}

function addComma(data) {
  if(!data) return 0;

	return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default Index;
