import React, { useState } from 'react'

const view = (props) => {

  const testdata = [
    {
      address: '0x07A6054c6323d501C62B6D125B4c7e56227fE00C',
      title: 'Lorem ipsum dolor sit',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      status: 'Active',
      answer: [
        { answer: 'Yes', vote: '7'},
        { answer: 'No', vote: '3'},
        { answer: 'Abstain', vote: '5'}
      ],
      endTime: '3',
      _id: 1,
      vote: [
        {address: '0xf27f5282e41875504636f9A6356eE2984B2CFdFd', answer: 'Yes', nft: 1},
        {address: '0xf27f5282e41875504636f9A6356eE2984B2CFdFd', answer: 'No', nft: 2},
        {address: '0xf27f5282e41875504636f9A6356eE2984B2CFdFd', answer: 'Yes', nft: 3},
        {address: '0xf27f5282e41875504636f9A6356eE2984B2CFdFd', answer: 'Yes', nft: 4},
        {address: '0xf27f5282e41875504636f9A6356eE2984B2CFdFd', answer: 'Abstain', nft: 1},
      ]
    },
    {
      address: '0xf27f5282e41875504636f9A6356eE2984B2CFdFd',
      title: 'Dao Test Second',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      status: 'Closed',
      answer: [
        { answer: 'Yes', vote: '4'},
        { answer: 'No', vote: '7'},
        { answer: 'Abstain', vote: '2'}
      ],
      endTime: '3',
      _id: 2,
      vote: [
        {address: '0xf27f5282e41875504636f9A6356eE2984B2CFdFd', answer: 'Yes', nft: 1},
        {address: '0xf27f5282e41875504636f9A6356eE2984B2CFdFd', answer: 'No', nft: 2},
        {address: '0xf27f5282e41875504636f9A6356eE2984B2CFdFd', answer: 'Yes', nft: 3},
        {address: '0xf27f5282e41875504636f9A6356eE2984B2CFdFd', answer: 'Yes', nft: 4},
        {address: '0xf27f5282e41875504636f9A6356eE2984B2CFdFd', answer: 'Abstain', nft: 1},
      ]
    },
    {
      address: '0xbB12b62dB8Ef3Be3AfCbf7B3f8806280d165626d',
      title: 'Dao Test Third',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      status: 'Active',
      answer: [
        { answer: 'Yes', vote: '3'},
        { answer: 'No', vote: '5'},
        { answer: 'Abstain', vote: '1'}
      ],
      endTime: '3',
      _id: 3,
      vote: [
        {address: '0xf27f5282e41875504636f9A6356eE2984B2CFdFd', answer: 'Yes', nft: 1},
        {address: '0xf27f5282e41875504636f9A6356eE2984B2CFdFd', answer: 'No', nft: 2},
        {address: '0xf27f5282e41875504636f9A6356eE2984B2CFdFd', answer: 'Yes', nft: 3},
        {address: '0xf27f5282e41875504636f9A6356eE2984B2CFdFd', answer: 'Yes', nft: 4},
        {address: '0xf27f5282e41875504636f9A6356eE2984B2CFdFd', answer: 'Abstain', nft: 1},
      ]
    },
    {
      address: '0x2b51a766F3bFC98C47253e8756EDC90BECDD88cB',
      title: 'Dao Test Fourth',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      status: 'Closed',
      answer: [
        { answer: 'Yes', vote: '5'},
        { answer: 'No', vote: '5'},
        { answer: 'Abstain', vote: '0'}
      ],
      endTime: '3',
      _id: 4,
      vote: [
        {address: '0xf27f5282e41875504636f9A6356eE2984B2CFdFd', answer: 'Yes', nft: 1},
        {address: '0xf27f5282e41875504636f9A6356eE2984B2CFdFd', answer: 'No', nft: 2},
        {address: '0xf27f5282e41875504636f9A6356eE2984B2CFdFd', answer: 'Yes', nft: 3},
        {address: '0xf27f5282e41875504636f9A6356eE2984B2CFdFd', answer: 'Yes', nft: 4},
        {address: '0xf27f5282e41875504636f9A6356eE2984B2CFdFd', answer: 'Abstain', nft: 1},
      ]
    }
  ]

  const [showToggle, setShowToggle] = useState(false)

  const proposalId = props?.location?.state?.proposalId;
  console.log(proposalId)
  if(testdata._id === proposalId) {
    console.log(testdata);
  }

  const showToggleHandler = () => {
    setShowToggle(true);
  }
  return (
    <div>
      {
      testdata?.map((list, idx) => {
        const address = list.address;
        const skipAddress = address?.slice(0, 6) + '...' + address?.slice(-4);
        return (
          <>
            {
              list._id === proposalId ?
              (
                <div key={idx} className='proposal-view-content'>
                  <div className='proposal-view-header'>
                    <h2>{list.title}</h2>
                    <div>
                      <p>{skipAddress}</p> 
                      <p>{list.status}</p>
                    </div>
                  </div>
                  <div className='proposal-view-desc'>
                    <p className={`${showToggle ? 'show' : 'closed'}`}>{list.description}</p>
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
                        list?.answer?.map((answer, idx) => (
                          <li key={idx}>
                            <p>{answer.answer}</p>
                            <p>14,241(33.33%)</p>
                          </li>
                        ))
                      }
                    </ul>
                  </div>
                  <div className='proposal-votelist'>
                    <h3>Vote</h3>
                    <ul>
                      {
                        list?.vote?.map((list, idx) => {
                          console.log(list)
                          const address = list.address;
                          const skipAddress = address?.slice(0, 6) + '...' + address?.slice(-4);
                          return (
                          <li key={idx}>
                            <p>{skipAddress}</p>
                            <p>{list.answer}</p>
                            <p>{list.nft}</p>
                          </li>
                        )})
                      }
                    </ul>
                  </div>
                </div>
              )
              :
              (
                null
              )
            }
          </>
        )
      })
    }
    </div>
  )
}

export default view