import React from 'react';
import Carousel from '@components/Carousel';
import FoodCard from '@components/FoodCard';
import Pizza from '@assets/img_pizza.jpg';
import Burger from '@assets/img_burger.jpg';
import Salad from '@assets/img_salad.jpg';
import Chicken from '@assets/img_chicken.jpg';
import Sushi from '@assets/img_sushi.jpg';

import { HomeContainer } from './styles';

// require('dotenv-webpack').config();
const test = process.env.REACT_APP_NFT_CONTRACT_ADDRESS;
console.log(test);

function Home() {
  console.log("test");
  return (
    <HomeContainer>
      <h1>Discover Menu</h1>
      <Carousel>
        <FoodCard img={Pizza} title="Pizza" />
        <FoodCard img={Burger} title="Burger" />
        <FoodCard img={Salad} title="Salad" />
        <FoodCard img={Sushi} title="Sushi" />
        <FoodCard img={Chicken} title="Chicken" />
      </Carousel>
    </HomeContainer>
  );
}

export default Home;
