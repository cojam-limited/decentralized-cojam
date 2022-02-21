import React from 'react';
import Button from '@components/Button';
import RandomTray from '@assets/img_tray.png';
import { RandomDrawContainer, Step } from './styles';
import { addUserMinter } from '@api/UseCaver';

function RandomDraw() {
  const handleClickAddUserMinter = () => {
    addUserMinter();
  };

  return (
    <RandomDrawContainer>
      <div className="tray_wrapper">
        <img src={RandomTray} className="img_randomtray" alt="random tray" />
        <h1>Pick what you want to eat!</h1>
      </div>

      <div className="step_wrapper">
        <Step>
          <span>Step 1</span>
          <Button text="Pick Randomly"></Button>
        </Step>
        <Step>
          <span>Step 2</span>
          <Button text="Upload Receipt"></Button>
        </Step>
        <Step>
          <span>Step 3</span>
          <Button text="Get NFT" onClick={handleClickAddUserMinter}></Button>
        </Step>
      </div>
    </RandomDrawContainer>
  );
}

export default RandomDraw;
