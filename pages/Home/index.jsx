import React from 'react';
import Carousel from '@components/Carousel';
import FoodCard from '@components/FoodCard';
import Pizza from '@assets/img_pizza.jpg';
import Burger from '@assets/img_burger.jpg';
import Salad from '@assets/img_salad.jpg';
import Chicken from '@assets/img_chicken.jpg';
import Sushi from '@assets/img_sushi.jpg';
import Receipt from '@assets/img_receipt.png';
import RandomTray from '@assets/img_tray.png';
import NFT from '@assets/NFT.png';
import NFT_group from '@assets/NFT_group.png';
import { Reveal, Slide } from 'react-awesome-reveal';
import { keyframes } from '@emotion/react';
import { HomeContainer, Intro, FlexContainer, MenuListContainer } from './styles';

const customAnimation = keyframes`
from {
	opacity: 0;
	transform: translateY(150px);
}
to {
	opacity: 1;
	transform: translateY(0);
}
`;

function Home() {
  return (
    <HomeContainer>
      <Intro>
        <img src={NFT_group} alt="BADGEMEAL" />
        <strong>BADGEMEAL</strong>
        <h1>뱃지밀은 평범한 당신의 일상에 특별한 가치를 부여해드립니다.</h1>
        <h2>식사라는 평범한 일상을 통해 특별한 NFT를 얻어 보세요.</h2>
        <h2>NFT를 많이 모으면 모을수록 당신은 뱃지밀 마스터가 될 수 있어요!</h2>
      </Intro>

      <Reveal keyframes={customAnimation}>
        <FlexContainer className="draw">
          <h1>#1. 오늘의 식사 메뉴를 뽑아보세요!</h1>
          <img src={RandomTray} className="img_randomtray rotateAnimation" alt="random tray" />
        </FlexContainer>
      </Reveal>
      <Reveal keyframes={customAnimation}>
        <FlexContainer className="wrap_reverse">
          <Slide>
            <img src={Receipt} alt="receipt" />
          </Slide>
          <h1>#2. 식사를 맛있게 하고 영수증으로 인증해보세요!</h1>
        </FlexContainer>
      </Reveal>
      <Reveal keyframes={customAnimation}>
        <FlexContainer>
          <h1>#3. 식사 후 NFT를 가지는 기쁨을 누려보세요!</h1>
          <img src={NFT} alt="BadgeMeal NFT" />
        </FlexContainer>
      </Reveal>
      <MenuListContainer>
        <h1>Discover Menu</h1>
        {/** 메뉴 api 연동 필요 */}
        <Carousel>
          <FoodCard img={Pizza} title="Pizza" />
          <FoodCard img={Burger} title="Burger" />
          <FoodCard img={Salad} title="Salad" />
          <FoodCard img={Sushi} title="Sushi" />
          <FoodCard img={Chicken} title="Chicken" />
        </Carousel>
      </MenuListContainer>
    </HomeContainer>
  );
}

export default Home;
