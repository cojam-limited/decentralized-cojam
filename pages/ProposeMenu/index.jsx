import React, { useRef } from 'react';
import AlertIcon from '@mui/icons-material/ErrorOutlineOutlined';
import Button from '@components/Button';
import Carousel from '@components/Carousel';
import FoodCard from '@components/FoodCard';
import Pizza from '@assets/img_pizza.jpg';
import Burger from '@assets/img_burger.jpg';
import Salad from '@assets/img_salad.jpg';
import Chicken from '@assets/img_chicken.jpg';
import Sushi from '@assets/img_sushi.jpg';

import { Container, UploadContainer } from './styles';

function ProposeMenu() {
  const inputRef = useRef();

  return (
    <Container>
      <h1>Current Proposed List</h1>
      <Carousel>
        <FoodCard img={Sushi} title="Sushi" />
        <FoodCard img={Chicken} title="Chicken" />
        <FoodCard img={Pizza} title="Pizza" />
        <FoodCard img={Burger} title="Burger" />
        <FoodCard img={Salad} title="Salad" />
      </Carousel>

      <UploadContainer>
        <div className="onlymaster">
          <AlertIcon color="warning" />
          <h1> Only Master NFT Owner</h1>
        </div>
        <input type="text" ref={inputRef} placeholder="enter what you want to eat" />
        <Button text="Upload your Menu"></Button>
      </UploadContainer>
    </Container>
  );
}

export default ProposeMenu;
