import styled from '@emotion/styled';

export const RandomDrawContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: calc(100% - 60px);
  overflow-y: scroll;
  .tray_wrapper {
    text-align: center;
    .img_food {
      width: 85%;
      max-width: 500px;
    }
    .img_randomtray {
      width: 85%;
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
    h1 {
      font-size: 20px;
      margin: 30px;
    }
  }

  .step_wrapper {
    width: 100%;
  }
`;

export const Step = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
  width: 100%;

  > span {
    font-size: 11px;
    text-align: center;
    border: 1px solid #7e0dfd;
    border-radius: 6px;
    color: #7e0dfd;
    padding: 5px 0;
    width: 50px;
    margin-right: 8px;
  }
`;
