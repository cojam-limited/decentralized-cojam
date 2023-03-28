import React, { useState } from 'react'
import { Icon } from '@iconify/react';
import toastNotify from '@utils/toast';
import { Proposal } from '../../../studio/src/actions/proposalActions';
import { validateTitle, validateDescr, validateOption } from '../../../utils/validate/proposal'
import { NftContract } from "../contractHelper";
import { useLoadingState } from "@assets/context/LoadingContext";
import { useHistory } from "react-router-dom";

const create = ({ setNeedNftModal }) => {

  const [ title, setTitle ] = useState('');
  const [ desc, setDesc ] = useState('');
  const [ answerCountList, setAnswerCountList ] = useState([1])
  const [ answer, setAnswer ] = useState();
  const [ newAccount, setNewAccount ] = useState(window?.klaytn?.selectedAddress?.toLowerCase());
  const [ network, setNetwork ] = useState(window?.klaytn?.networkVersion)

  const { setLoading } = useLoadingState();
  const history = useHistory();

  window.klaytn.on('accountsChanged', (accounts) => {
    setNewAccount(accounts[0]);
  });

  window?.klaytn.on('networkChanged', (networkVer) => {
    setNetwork(networkVer)
  });

  const titleHandler = (e) => {
    setTitle(e.target.value);
  }

  const descHandler = (e) => {
    setDesc(e.target.value);
  }

  const createBtnHandler = async () => {
    setLoading(true);
    const balance = await NftContract().methods.balanceOf(newAccount).call();
    
    if(Number(balance) !== 5) {
      setNeedNftModal(true)
      return;
    }

    let answerArr = [];
    for (const key in answer) {
      answerArr.push(answer[key]);
    }

    try {
      validateTitle(title)
      validateDescr(desc)
      validateOption(answerArr)
      await Proposal.create(title, desc, answerArr, newAccount)
      toastNotify({
        state: 'success',
        message: 'Proposal Created Success!'
      })
      setLoading(false);
      history.push('/Dao/DaoProposals');
    } catch (err) {
      toastNotify({
        state: 'error',
        message: `${err.message}`,
      });
      setLoading(false);
    }
  }

  const selectBtnHandler = (status) => {
    if(status === 'add') {
      if(answerCountList.length < 5) {
        let countArr = [...answerCountList];
        let count = countArr.slice(-1)[0];
        count += 1;
        countArr.push(count);
        setAnswerCountList(countArr);
      } else {
        toastNotify({
          state: 'error',
          message: `Cannot create more than ${answerCountList.length} selects.`,
        });
        return;
      }
    }
    if(status === 'minus') {
      if(answerCountList.length > 1) {
        let answerArr = [];
        for (const key in answer) {
          answerArr.push(answer[key]);
        }
        let answerObj = {...answer};
        const leng = answerArr.length;
        delete answerObj[leng];
        setAnswer(answerObj);

        let countArr = [...answerCountList];
        countArr.pop();
        setAnswerCountList(countArr);
      } else {
        toastNotify({
          state: 'error',
          message: `At least 1 select is required.`,
        });
        return;
      }
    }
  }

  const answerObject = (e) => {
    const { value, name } = e.target;
    setAnswer({...answer, [name]: value})
  }

  return (
    <div className='proposal-create-content'>
      <div>
        <h2 className='proposal-subtitle'>Title <span className='star'>*</span></h2>
        <input type="text" value={title} onChange={(e) => {titleHandler(e)}}/>
      </div>
      <div>
        <div className='proposal-desc-wrap'>
          <h2 className='proposal-subtitle'>Description <span className='star'>*</span></h2>
          <p>{desc?.length === undefined ? 0 : desc?.length}/14,400</p>
        </div>
        <textarea value={desc} onChange={(e) => {descHandler(e)}} />
      </div>
      <div>
        <div className='proposal-title-wrap'>
          <h2 className='proposal-subtitle'>Select <span className='star'>*</span></h2>
          <div className='proposal-btn-wrap'>
            <div onClick={() => {selectBtnHandler('add')}}>
              <Icon icon="mdi:plus-circle" />
            </div>
            <div onClick={() => {selectBtnHandler('minus')}}>
              <Icon icon="mdi:minus-circle" />
            </div>
          </div>
        </div>
        <ul>
          {
            answerCountList && answerCountList.map((val, idx) => {
              return (
                <li key={idx}>
                  <input name={val} type='text' onChange={answerObject} />
                </li>
              )
            })

          }
        </ul>
      </div>
      <p className='create-notice'>* You need 5 NFTs to Proposal.</p>
      <div
        className='createBtn'
        onClick={createBtnHandler}
      >
        <button>
          Create Proposal
        </button>
      </div>
    </div>
  )
}

export default create