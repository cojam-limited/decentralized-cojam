import styled from '@emotion/styled';

export const HomeContainer = styled.div`
  padding: 20px;
  max-width: 1024px;
  margin: auto;

  > h1 {
    font-size: 20px;
    margin-bottom: 10px;
  }
`;

export const Intro = styled.div`
  text-align: center;
  > img {
    width: 100%;
    margin-bottom: 20px;
  }
  > strong {
    font-size: 40px;
    margin-bottom: 20px;
  }

  > h1 {
    font-size: 25px;
    line-height: 2;
    font-family: 'Ubuntu', sans-serif;
  }
  > h2 {
    font-size: 22px;
    line-height: 1.5;
  }
`;

export const FlexContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin: 30px 0;

  > h1 {
    font-size: 25px;
    box-shadow: inset 0px -13px 0px 0px rgb(255 182 0 / 65%);
  }

  .img_randomtray {
    width: 80%;
    max-width: 500px;

    &.rotateAnimation {
      animation: rotateTray 0.3s linear 0s infinite normal;
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
`;
