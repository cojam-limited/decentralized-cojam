import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import { useLoadingState } from "@assets/context/LoadingContext";
import Pagination from "react-sanity-pagination";

import { Proposal } from '../../../studio/src/actions/proposalActions'
import { client } from "../../../sanity";
import { setProposal } from '../../../api/UseWeb3';

function Index() {
  const { setLoading } = useLoadingState();
  const history = useHistory();
  
  const [ activeCategory, setActiveCategory ] = useState('All');
  const [ data, setData ] = useState([]);
  const [ newAccount, setNewAccount ] = useState(window?.klaytn?.selectedAddress?.toLowerCase());
  const amdinContractAddress = process.env.REACT_APP_ADMIN_ADDRESS;
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
      setData(data);
    } else if(activeCategory === 'Active') {
      const data = await Proposal.listOpen()
      setData(data);
    } else if(activeCategory === 'Closed') {
      const data = await Proposal.listClosed()
      setData(data);
    }
    setLoading(false);
  }, [activeCategory])

  const clickHandler = async (list, diff) => {
    if(diff < 0 && amdinContractAddress.toLowerCase() === newAccount.toLowerCase() && list.proposalTxHash === null) {
      try {
        let endTime = Date.parse(list.endTime)
        const data = {
          proposalKey: list.proposalKey,
          title: list.title,
          result: '다섯번째',
          totalVote: 0,
          resultVote: 0,
          endTime: endTime,
        }
        const result = await setProposal(data)
        await client.patch(list._id).set({proposalTxHash: result.transactionHash}).commit();
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

	// pagenation settings
	let postsPerPage = 6;
	const [ items, setItems ] = useState([]);
	const [ itemsToSend, setItemsToSend ] = useState([]);

  const action = (page, range, items) => {
		setItems(items);
	};

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
            <ul className='dao-proposal-content'>
              {
                data.map((list, idx) => {
                  console.log(list)
                  const endTime = new Date(list.endTime);
                  const nowTime = new Date();
                  const diff = endTime - nowTime;

                  const diffDay = Math.floor(diff / (1000*60*60*24));
                  const diffHour = Math.floor((diff / (1000*60*60)) % 24);
                  const diffMin = Math.floor((diff / (1000*60)) % 60);
                  const diffSec = Math.floor(diff / 1000 % 60);
                  return (
                    <li key={idx} onClick={() => clickHandler(list, diff)}>
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
                                    return (
                                      <li
                                        key={idx}
                                      >
                                        <p>{val.option}</p>
                                        <p>{val.total}</p>
                                      </li>
                                    )
                                  }
                                )
                              }
                            </ul>
                          )
                        }
                      </li>
                    )})
                  }
            </ul>
          {/* Proposal 리스트 루프 End */}
          </ul>
        </div>
        {/* 리스트 끝 */}

        {/* 페이지네이션 */}
				{
          itemsToSend.length > 0 && 
          <Pagination
						nextButton={true}
						prevButton={true}
						nextButtonLabel={">"}
						prevButtonLabel={"<"}
						items={itemsToSend}
						action={action}
						postsPerPage={postsPerPage}
				  />
        }
				{/* 페이지네이션 끝 */}

        {/* Proposal-footer Start */}
        <div
          className='proposal-footer'
          onClick={goToCreateProposal}
        >
          <p>Create Proposal</p>
        </div>
        {/* Proposal-footer End */}
      </div>
    </div>
  )
}

function addComma(data) {
  if(!data) return 0;

	return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default Index;
