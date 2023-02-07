import React, { useState, useEffect } from 'react'
import { Proposal } from '../../../studio/src/actions/proposalActions'
import { isAvailableToVote } from '../../../studio/src/service/proposalService';
import toastNotify from '@utils/toast';
import { useLoadingState } from "@assets/context/LoadingContext";

const view = (props) => {

  const [ data, setData ] = useState();
  const [ voteList, setVoteList ] = useState();
  const [ selectAnswer, setSelectAnswer ] = useState();
  const [ showToggle, setShowToggle ] = useState(false);
  const [ newAccount, setNewAccount ] = useState(window?.klaytn?.selectedAddress?.toLowerCase());
  const [ render, setRender ] = useState(false);
  const [ totalAmount, setTotalAmount] = useState();
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

  const address = data?.creator;
  const skipAddress = address?.slice(0, 6) + '...' + address?.slice(-4);
  console.log('total', totalAmount)
  return (
    <div>
      <div className='proposal-view-content'>
        <div className='proposal-view-header'>
          <h2>{data?.title}</h2>
          <div>
            <p>{skipAddress}</p> 
            <p className={`${diff > 0 ? 'active' : 'closed'}`}>
              {diff > 0 ? 'Active' : 'Closed'}
            </p>
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
          <ul>
            {
              data?.options?.map((answer, idx) => (
                <li
                  key={idx}
                  className={selectAnswer === answer ? 'answer-select' : ''}
                  onClick={() => voteSelectHandler(answer)}
                >
                  <p>{answer.option}</p>
                  <p>{answer.total}({(answer.total / totalAmount) * 100}%)</p>
                </li>
              ))
            }
          </ul>
          <button onClick={() => {voteConfirmHandler()}}>Confirm</button>
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
    </div>
  )
}

export default view