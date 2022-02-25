import React, { useEffect, useState } from 'react';
import Carousel from '@components/Carousel';
import FoodCard from '@components/FoodCard';
import Receipt from '@assets/img_receipt.png';
import RandomTray from '@assets/img_tray.png';
import NFT from '@assets/NFT.png';
import NFT_group from '@assets/NFT_group.png';
import { Reveal, Slide } from 'react-awesome-reveal';
import { keyframes } from '@emotion/react';
import { HomeContainer, Intro, FlexContainer, MenuListContainer, NFTContainer } from './styles';

import { getNFTList } from '@api/UseKAS';
import { useMenusData } from '@api/menus';

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
  const [nftList, setNftList] = useState([]);
  const { menusData } = useMenusData();

  const getMintedNftList = async () => {
    try {
      const list = await getNFTList();
      setNftList(list);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getMintedNftList();
  }, []);

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

      <NFTContainer>
        <h1>Discover NFT Collection</h1>
        {!nftList?.length ? (
          <div>There is no NFT</div>
        ) : (
          <Carousel>
            {nftList.map((item) => (
              <FoodCard key={item.imageUri} img={item.imageUri} title={item.menuType} />
            ))}
          </Carousel>
        )}
      </NFTContainer>

      <MenuListContainer>
        <h1>Discover Menu</h1>
        {!menusData.length ? (
          <div>There is no Menus</div>
        ) : (
          <Carousel>
            {menusData.map((item) => (
              <FoodCard key={item.imageUrl} img={item.imageUrl} title={item.type} />
            ))}
          </Carousel>
        )}
      </MenuListContainer>
    </HomeContainer>
  );
}

export default Home;
