import React from 'react'
import { Icon } from '@iconify/react';

const create = ({ needNftModal, setNeedNftModal }) => {
  console.log(setNeedNftModal)
  const createBtnHandler = () => {
    setNeedNftModal(true)
    console.log(needNftModal)
  }
  return (
    <div className='proposal-create-content'>
      <div>
        <h2 className='proposal-subtitle'>Title <span className='star'>*</span></h2>
        <input type="text" />
      </div>
      <div>
        <div className='proposal-desc-wrap'>
          <h2 className='proposal-subtitle'>Description</h2>
          <p>0/14,400</p>
        </div>
        <textarea />
      </div>
      <div>
        <h2 className='proposal-subtitle'>Select <span className='star'>*</span></h2>
        <ul>
          <li>
            <input type='text' />
            <div>
              <Icon icon="mdi:plus-circle" />
            </div>
          </li>
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