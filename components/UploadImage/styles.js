import styled from '@emotion/styled';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  padding: 20px;
  text-align: center;
`;

export const BoxUpload = styled.div`
  display: grid;
  margin-top: 20px;
  place-items: center;
  border: 1px dashed #799cd9;
  min-height: 200px;
  width: 100%;
  background: #fbfbff;
  border-radius: 20px;
  margin-bottom: 20px;

  .image-upload {
    display: flex;
    flex-wrap: wrap;
    label {
      cursor: pointer;
      :hover {
        color: #041e87;
        p {
          color: #041e87;
          font-weight: bold;
        }
      }
    }
    > input {
      display: none;
    }
  }
`;

export const ImagePreview = styled.div`
  padding: 10px;
  img {
    width: 100%;
  }
`;

export const DeleteFileButton = styled.button`
  text-align: center;
  font-size: 15px;
  font-weight: bold;
  color: #000;
  padding: 15px;
  border: 1px solid #000;
  border-radius: 8px;
  width: 100%;
  margin-top: 10px;
`;
