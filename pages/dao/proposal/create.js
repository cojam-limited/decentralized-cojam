import React, { useState } from 'react'
import { Icon } from '@iconify/react';

const create = ({ setNeedNftModal }) => {

  const [ title, setTitle ] = useState();
  const [ desc, setDesc ] = useState();

  const titleHandler = (e) => {
    setTitle(e.target.value);
  }

  const descHandler = (e) => {
    setDesc(e.target.value);
  }

  const createBtnHandler = () => {
    setNeedNftModal(true)
  }

  return (
    <div className='proposal-create-content'>
      <div>
        <h2 className='proposal-subtitle'>Title <span className='star'>*</span></h2>
        <input type="text" value={title} onChange={(e) => {titleHandler(e)}}/>
      </div>
      <div>
        <div className='proposal-desc-wrap'>
          <h2 className='proposal-subtitle'>Description</h2>
          <p>{desc?.length === undefined ? 0 : desc?.length}/14,400</p>
        </div>
        <textarea value={desc} onChange={(e) => {descHandler(e)}} />
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