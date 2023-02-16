import React, { useState, useEffect, useRef } from 'react'
import { Proposal } from '../../../studio/src/actions/proposalActions'
import { isAvailableToVote } from '../../../studio/src/service/proposalService';
import toastNotify from '@utils/toast';
import { useLoadingState } from "@assets/context/LoadingContext";
import { lastElementsForPage } from '../../../studio/src/maker';

const view = (props) => {

  const [ data, setData ] = useState();
  const [ voteList, setVoteList ] = useState([]);
  const [ selectAnswer, setSelectAnswer ] = useState();
  const [ showToggle, setShowToggle ] = useState(false);
  const [ newAccount, setNewAccount ] = useState(window?.klaytn?.selectedAddress?.toLowerCase());
  const [ render, setRender ] = useState(false);
  const [ totalAmount, setTotalAmount] = useState();
  const [ notData, setNotData ] = useState(false);
  const { setLoading } = useLoadingState();

  window.klaytn.on('accountsChanged', (accounts) => {
    setNewAccount(accounts[0]);
  });
  const proposalKey = props?.location?.state?.proposalId;
  const diff = props?.location?.state?.diff;

  useEffect(async () => {
    setLoading(true);
    const data = await Proposal.view(proposalKey);
    setData(data)
    const votelist = await Proposal.voteList(proposalKey);
    setNotData(false)
    setVoteList(votelist)
    setLoading(false);
  }, [render])

  const showToggleHandler = () => {
    setShowToggle(true);
  }

  const voteSelectHandler = async (data) => {
    setSelectAnswer(data);
  }

  const voteConfirmHandler = async () => {
    setLoading(true);
    try {
      const proposalId = data?._id;
      const proposalOptionId = selectAnswer?._id;
      const voter = newAccount;
      const votableNfts = await isAvailableToVote(proposalKey, voter);
      const result = await Proposal.vote(proposalId, proposalKey, proposalOptionId, voter, votableNfts);
      if(result) {
        toastNotify({
          state: 'success',
          message: 'Successfully voted !',
        });
      }
      setRender(!render);
      setLoading(false);
    } catch(err) {
      console.error(err)
      toastNotify({
        state: 'error',
        message: err.message,
      });
      setLoading(false);
    }
  }

  useEffect(() => {
    if(data) {
      let totalArr = []
      data.options.map((options) => {
        totalArr.push(options.total)
        const total = totalArr.reduce((pre, cur) => pre + cur, 0);
        setTotalAmount(total)
      })
    }
  }, [data])

  const obsRef = useRef(null) // observer Element
  const [page, setPage] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(obsHandler, { threshold: 0.1 });
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

  const getVoteList = async () => {
    setLoading(true)
		const {lastValue, lastId} = lastElementsForPage(voteList, `_createdAt`)
    if(lastValue !== null && lastId !== null) {
      const votelist = await Proposal.voteListPaged(proposalKey, lastValue, lastId);
      if(votelist.length === 0) {
        setNotData(true);
        setLoading(false)
      }
      setVoteList(prev => {
        return [...prev, ...votelist]
      })
      setLoading(false)
    }
  }

	useEffect(() => {
    if(!notData) {
      getVoteList()
    }
  }, [page])

  const address = data?.creator;
  const skipAddress = address?.slice(0, 6) + '...' + address?.slice(-4);
  const resultVote = data?.options?.filter((votes, idx, target) => {
    const maxOfVote = Math.max(...target.map(vote => vote.total));
    return votes.total === maxOfVote;
  })
  return (
    <div>
      <div className='proposal-view-content'>
        <div className='proposal-view-header'>
          <h2>{data?.title}</h2>
          <div>
            <p>{skipAddress}</p> 
            <div>
              {
                data?.proposalTxHash ? (
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
        </div>
        <div className='proposal-view-desc'>
          <p className={`${showToggle ? 'show' : 'closed'}`}>{data?.description}</p>
          {
            showToggle ? (
              null
            ) : 
            (
              <button onClick={showToggleHandler}>Show More</button>
            )
          }
        </div>
        <div className='proposal-answer'>
          <h3>Cast your vote</h3>
          <ul className={diff < 0 ? 'closeQuest' : ''}>
            {
              data?.options?.map((answer, idx) => {
                const percent = !isFinite(answer.total / totalAmount) ? '0' : ((answer.total / totalAmount) * 100).toFixed(2);
                return (
                  diff > 0 ? (
                    <li
                      key={idx}
                      className={selectAnswer === answer ? 'answer-select' : ''}
                      onClick={() => voteSelectHandler(answer)}
                    >
                      <p>{answer.option}</p>
                      <p>{answer.total}({percent}%)</p>
                    </li>
                  ) : (
                    <li
                      key={idx}
                      className={
                        resultVote.length === 1 && resultVote[0] === answer ? 'winnerAnswer' :
                        resultVote.length > 1 ? 'drawAnswer' : ''
                      }
                      onClick={() => voteSelectHandler(answer)}
                    >
                      <p>{answer.option}</p>
                      <p>{answer.total}({percent}%)</p>
                    </li>
                  )
              )})
            }
          </ul>
          {
            diff > 0 ? (
              <button onClick={() => {voteConfirmHandler()}}>Confirm</button>
            ) : (null)
          }
        </div>
        <div className='proposal-votelist'>
          <h3>Vote</h3>
          <ul>
            {
              voteList?.map((list, idx) => {
                const address = list.voter;
                const skipAddress = address?.slice(0, 6) + '...' + address?.slice(-4);
                return (
                <li key={idx}>
                  <p>{skipAddress}</p>
                  <p>{list.option[0]}</p>
                  <p>{list.count}</p>
                </li>
              )})
            }
          </ul>
        </div>
      </div>
      <div
      ref={obsRef}
      style={{
        width: '100%',
        height:'5px',
        display: notData ? 'none' : 'block'
      }}></div>
    </div>
  )
}

export default view