import styled from '@emotion/styled';

export const HomeContainer = styled.div`
  padding-bottom: 80px;
  max-width: 1024px;
  margin: auto;
`;

export const Intro = styled.div`
  text-align: center;
  margin-bottom: 150px;
  > img {
    width: 100%;
    margin-bottom: 40px;
  }
  > strong {
    font-size: 45px;
  }

  > h1 {
    font-size: 25px;
    line-height: 2;
    font-family: 'Ubuntu', sans-serif;
    margin: 40px 0 30px;
  }
  > h2 {
    font-size: 22px;
    line-height: 1.5;
    font-weight: normal;
  }

  @media screen and (max-width: 768px) {
    margin-bottom: 50px;
    > img {
      margin-bottom: 40px;
    }
    > strong {
      font-size: 35px;
    }

    > h1 {
      font-size: 20px;
      line-height: 1.3;
      font-family: 'Ubuntu', sans-serif;
      margin: 20px 0 10px;
      padding: 0 10px;
    }
    > h2 {
      font-size: 15px;
      line-height: 1.3;
      padding: 0 10px;
    }
  }
`;

export const FlexContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin: 50px 0;

  > h1 {
    font-size: 25px;
    background: rgb(255 182 0 / 50%);
    padding: 20px 10px;
    margin: 10px;
  }
  img {
    width: 100%;
    max-width: 500px;
  }

  .img_randomtray {
    width: 70%;
    max-width: 500px;
    &.rotateAnimation {
      animation: rotateTray 0.5s linear 0s infinite normal;
    }

    @keyframes rotateTray {
      0% {
        transform: rotate(0);
      }
      25% {
        transform: rotate(-6deg);
      }
      50% {
        transform: rotate(0);
      }
      75% {
        transform: rotate(6deg);
      }
      100% {
        transform: rotate(0);
      }
    }
  }

  &.wrap_reverse {
    flex-wrap: wrap-reverse;
  }

  @media screen and (max-width: 768px) {
    > h1 {
      width: 100%;
      font-size: 20px;
      margin-bottom: 30px;
      text-align: center;
    }
  }
`;

export const MenuListContainer = styled.div`
  margin-top: 100px;

  > h1 {
    font-size: 25px;
    margin: 10px 0;
  }
`;
