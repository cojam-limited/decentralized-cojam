# 🎨 Badgemeal Frontend

## ✅ start & build

### .env 작성

- `.env.development`
```
REACT_APP_NFT_CONTRACT_ADDRESS = "0x8Ec4f1881361fbcfD1CeA615C2AFa216668E2E2E"
REACT_APP_VOTE_CONTRACT_ADDRESS = "0x3166433C1FC37F52d0C6480ab3BD997dFEd23d5c"
REACT_APP_CHAIN_ID = "1001"
REACT_APP_ACCESS_KEY_ID = ""
REACT_APP_SECRET_ACCESS_KEY = ""
REACT_APP_DEPLOYER_PRIVATE_KEY = ""
```

- `.env.production`
```
REACT_APP_NFT_CONTRACT_ADDRESS = "0x5b35552c347301DDC6E5D0Cf5F1a4445E294Fb8c"
REACT_APP_VOTE_CONTRACT_ADDRESS = "0xA2d17c0C6E2102c57bC519D36b71F9c9BE2f59C3"
REACT_APP_CHAIN_ID = "8217"
REACT_APP_ACCESS_KEY_ID = ""
REACT_APP_SECRET_ACCESS_KEY = ""
REACT_APP_DEPLOYER_PRIVATE_KEY = ""
```

### webpack-dev-server로 실행

`npm run start`

### Build

`npm run build`

### Lint

`npm run lint`

---

## ✅ 개발환경

| 분류 | 내용 |
| --- | --- |
| 기술스택 | JavaScript, SWR, React.js, caver-js, webpack, Materia UI |
| 의존성 관리 도구 | NPM |
| 주요 개발 도구 | Visual Studio Code, Chrome |

---

## ✅ 프로젝트 관리

| 분류  | 내용 |
| --- | --- |
| 배포  | Nginx 웹서버 |
| 버전 관리 시스템 | Git, GitHub |

---

## ✅ utils 패키지

- 공용으로 사용하는 함수들과 관련된 패키지

### `fetcher.js`

- axios 인스턴스 생성
```js
export const Axios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});
```

- http GET 요청
```js
export const getDataFetcher = async (url) => {
  const res = await Axios.get(url).catch(function (error) {
    if (error.response && error.response.status > 400) {
      // 요청이 이루어졌으며 400이상 에러를 처리
      const requestError = new Error('An error occurred.');
      // 에러 객체에 부가 정보를 추가합니다.
      requestError.status = error.response.status;
      requestError.message = error.response.data.message;
      throw requestError;
    } else if (error.request) {
      // 요청이 이루어 졌으나 응답을 받지 못함
      console.log(error.request);
    } else {
      // 오류를 발생시킨 요청을 설정하는 중에 문제가 발생
      console.log('Error', error.message);
    }
  });
  return res?.data;
};
```

- http POST 요청
```js
export const postDataFetcher = async (url, body) => {
  const res = await Axios.post(url, body).catch(function (error) {
      {/*생략*/}
  });
  return res?.data;
};
```

- http PUT 요청
```js
export const putDataFetcher = async (url, body) => {
  const res = await Axios.put(url, body).catch(function (error) {
      {/*생략*/}
  });
  return res?.data;
};
```

- SWR 전역 데이터 상태 관리 fetcher
```js
export const localDataFetcher = (key) => {
  if (sessionStorage.getItem(key) === null) {
    return;
  } else {
    return JSON.parse(sessionStorage.getItem(key));
  }
};
```

### `isMobile.js`

- useragent에 따라서 boolean값 반환

```ts
export const isMobileOS = () => { ... ['android', 'iphone', 'ipad', 'ipod'] ...}
```

### `toast.js`

- props에 따라서 toast 함수 반환

```ts
const toastNotify = (props) => {
  const { state, message } = props;
    {/*생략*/}

    return toast[state](message, {
      position: 'bottom-left',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
    });
};
```

---

## ✅ Kaikas 연동

- `UseKaikas.js` : Kaikas 연동하여 트랜잭션 실행

#### caver 객체 생성 및 NFT 컨트랙트 객체 생성
```js
const caver = new Caver(window.klaytn);
const NFTContract = new caver.contract(NFTABI, NFT_ADDRESS);
const VoteContract = new caver.contract(VOTEABI, VOTE_ADDRESS);
```

#### Kaikas wallet 연동
```js
export const kaikasLogin = async () => {
    const accounts = await window.klaytn.enable();
    const account = accounts[0]; 
    return account;
    {/*생략*/}
};
```
#### Klaytn 계정 주소의 잔액을 반환
```js
export const kaikasGetBalance = async (address) => {
    const balance = await caver.rpc.klay.getBalance(address);
    return balance;
    {/*생략*/}
};
```
#### 뱃지밀 NFT 발행 
- 스마트 컨트랙트 내에서 일반/마스터 NFT 구분해서 발행
- 트랜잭션의 result에서 event를 파싱하여 마스터 NFT DB업데이트
- `caver.klay.sendTransaction` : 스마트 컨트랙트 트랜잭션 실행
- `estimateGas` : 트랜잭션 예상 가스비 추정
- `encodeABI` : 메소드의 ABI 인코딩
- `decodeLog` : ABI 인코딩된 로그 데이터 및 인덱싱된 토픽 데이터를 디코딩

```js
export const mintWithTokenURI = async ({
  tokenID,
  genralTokenURI,
  masterTokenURI,
  menuType,
  walletData,
  mintCountData,
  cid,
}) => {
  try {
    const estimatedGas = await NFTContract.methods
      .mintWithTokenURI(window.klaytn.selectedAddress, tokenID, genralTokenURI, masterTokenURI, menuType)
      .estimateGas({
        from: window.klaytn.selectedAddress,
      });

    const encodedData = NFTContract.methods
      .mintWithTokenURI(window.klaytn.selectedAddress, tokenID, genralTokenURI, masterTokenURI, menuType)
      .encodeABI();

    await caver.klay
      .sendTransaction({
        type: 'SMART_CONTRACT_EXECUTION',
        from: window.klaytn.selectedAddress,
        to: process.env.REACT_APP_NFT_CONTRACT_ADDRESS,
        data: encodedData,
        value: '0x00',
        gas: estimatedGas
      })
      .on('transactionHash', (hash) => {
        console.log(`transactionHash ${hash}`);
      })
      .on('receipt', (receipt) => {
        // success
        {/*...생략. 트랜잭션이 성공하면 그에 따른 각종 함수 실행 */}

        const decodedMintMasterNFTeventLog = caver.klay.abi.decodeLog(
          [
            {
              indexed: false,
              name: 'typeString',
              type: 'string',
            },
          ], //"MintMasterNFT" ABI JSON interface
          receipt.logs[1].data,
          receipt.logs[1].topics.slice(1),
        );

        if (decodedMintMasterNFTeventLog?.typeString === 'MintMasterNFT') {
          //마스터 NFT 발행 이벤트를 캐치하면 마스터 NFT DB업데이트
          updateMintedMasterNft(cid);
        }
      })
      .on('error', (e) => {
        // failed
        {/*...생략. 트랜잭션이 실패하면 그에 따른 각종 함수 실행 */}
      });
  } catch (error) {
    console.error('mintWithTokenURI', error);
  }
};
```

#### 메뉴 추가 제안 : Vote 컨트랙트 proposeMenu 메소드 호출

```js
export const proposeMenu = async (name) => {
  try {
    const estimatedGas = await VoteContract.methods.proposeMenu(name, NFT_ADDRESS).estimateGas({
      from: window.klaytn.selectedAddress,
    });
    const encodedData = VoteContract.methods.proposeMenu(name, NFT_ADDRESS).encodeABI();

    await caver.klay
      .sendTransaction({
        type: 'SMART_CONTRACT_EXECUTION',
        from: window.klaytn.selectedAddress,
        to: process.env.REACT_APP_VOTE_CONTRACT_ADDRESS,
        data: encodedData,
        value: '0x00',
        gas: estimatedGas,
      })
    {/*생략*/}
  } catch (error) {
    console.error('proposeMenu', error);
  }
};
```

#### 메뉴 제안에 투표 : Vote 컨트랙트 vote 메소드 호출

```js
export const vote = async (proposal) => {
  try {
    const estimatedGas = await VoteContract.methods.vote(proposal, NFT_ADDRESS).estimateGas();
    const encodedData = VoteContract.methods.vote(proposal, NFT_ADDRESS).encodeABI();
    await caver.klay
      .sendTransaction({
        type: 'SMART_CONTRACT_EXECUTION',
        from: window.klaytn.selectedAddress,
        to: process.env.REACT_APP_VOTE_CONTRACT_ADDRESS,
        data: encodedData,
        value: '0x00',
        gas: estimatedGas,
      })
    {/*생략*/}
  } catch (error) {
    console.error('vote', error);
  }
};
```

#### 일반/마스터 NFT 홀더 검증

- `isBadgemealNFTholder` : 일반 NFT 홀더이면 true, 아니면 false 반환
- `isBadgemealMasterNFTholder` : 마스터 NFT 홀더이면 true, 아니면 false 반환

#### 메뉴 제안 리스트 및 채택된 메뉴 리스트 조회

- `getProposalList` : 일반 NFT 홀더이면 true, 아니면 false 반환
- `getWinnerProposalList` : 마스터 NFT 홀더이면 true, 아니면 false 반환

--- 

## ✅ KAS 연동

- `UseKas.js` : KAS 연동하여 트랜잭션 실행

#### KAS API 사용하기 위한 option 객체 생성
```js
const option = {
  headers: {
    Authorization:
      'Basic ' +
      Buffer.from(process.env.REACT_APP_ACCESS_KEY_ID + ':' + process.env.REACT_APP_SECRET_ACCESS_KEY).toString(
        'base64',
      ),
    'x-chain-id': process.env.REACT_APP_CHAIN_ID,
    'content-type': 'application/json',
  },
};
```

#### 특정 EOA가 가진 모든 NFT 토큰 정보 조회
- 기본값 100개까지 조회
```js
export const ownNftList = async (ownaddress) => {
  try {
    const response = await axios.get(
      `https://th-api.klaytnapi.com/v2/contract/nft/${process.env.REACT_APP_NFT_CONTRACT_ADDRESS}/owner/${ownaddress}`,
      option,
    );
    const data = response.data.items;
    {/*생략*/}
  } catch (error) {
    console.log(error);
  }
};
```

#### 특정 NFT 컨트랙트의 모든 토큰 정보 조회
- 기본값 100개까지 조회
```js
export const getNFTList = async () => {
  try {
    const response = await axios.get(
      `https://th-api.klaytnapi.com/v2/contract/nft/${process.env.REACT_APP_NFT_CONTRACT_ADDRESS}/token`,
      option,
    );
    const data = response.data.items;
    {/*생략*/}
  } catch (error) {
    console.log(error);
  }
};
```

---

## ✅ Caver 연동

- `UseCaverForOwner.js` : caver 객체에 contract owner account 설정하고 트랜잭션 실행

#### caver 객체 생성 및 NFT 컨트랙트 객체 생성
```js
const caver = new Caver(new Caver.providers.HttpProvider('https://node-api.klaytnapi.com/v1/klaytn', option));
const NFTContract = new caver.contract(NFTABI, NFT_ADDRESS);
```

#### caver 객체에 contract owner account 설정
```js
const deployer = caver.wallet.keyring.createFromPrivateKey(process.env.REACT_APP_DEPLOYER_PRIVATE_KEY);
caver.wallet.add(deployer);
```

#### 유저에게 임시로 minter 권한 부여
```js
await NFTContract.methods.addBadgemealMinter(account).send({
      from: deployer.address, // owner 주소
      gas: String(estimatedGas),
    });
```

#### 유저의 minter 권한 삭제
```js
await NFTContract.methods.removeBadgemealMinter(account).send({
      from: deployer.address, // owner 주소
      gas: String(estimatedGas),
    });
```

---

## ✅ api 패키지

- api를 호출하고 전역적으로 사용하는 SWR 데이터를 다루는 패키지

### [draw.js]

#### 개요

- useDrawResultData : 특정 주소의 랜덤 뽑기 결과 인증 여부 조회
- useDrawMenuNumberData : 특정 주소의 랜덤 뽑기 메뉴 번호 조회
- initDrawResult : 특정 주소의 랜덤 뽑기 결과 초기화

#### Hook 사용법

```ts
//useDrawResultData
const { drawResultData } = useDrawResultData(walletData?.account);

//useDrawMenuNumberData
const { menuNoData } = useDrawMenuNumberData(walletData?.account);

//initDrawResult
initDrawResult(walletData?.account);
```

### [menus.js]

#### 개요

- useMenusData : 메뉴 리스트 조회

#### Hook 사용법

```ts
const { menusData } = useMenusData();
```

### [mintData.js]

#### 개요

- useMintData : 해당 주소에 매핑된 mint data 조회
- initMintData : 해당 주소에 매핑된 mint data 초기화

#### Hook 사용법

```ts
//useMintData
const { menusData } = useMenusData();
//initMintData
initMintData(walletData?.account);
```

### [nft.js]

#### 개요

- useMintCountData : 해당 주소의 현재 회차의 NFT 발급 횟수 조회
- updateMintCount : 해당 주소의 현재 회차의 NFT 발급 횟수 수정

#### Hook 사용법

```ts
//useMintCountData
  const { mintCountData } = useMintCountData(walletData?.account);
//updateMintCount
updateMintCount(walletData?.account, mintCountData);
```

### [ipfs.js]

#### 개요

- SWR로 관리하지 않음.
- getMasterNftMetadataFetcher : 마스터 NFT 메타데이터 URL 조회
- updateMintedMasterNft : 해당 메타데이터의 NFT 발행 여부 업데이트

#### Hook 사용법

```ts
//useDrawResultData
const { drawResultData } = useDrawResultData(walletData?.account);

//useDrawMenuNumberData
const { menuNoData } = useDrawMenuNumberData(walletData?.account);

//initDrawResult
initDrawResult(walletData?.account);
```
