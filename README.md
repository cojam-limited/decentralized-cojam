1. 프로젝트 개요
  - Kaikas & Klip 을 통해 탈중앙화된 Cojam Front-end
  - Admin으로 등록된 계정으로 Quest 등록 및 State 변화를 줄 수 있다. (pending, approve, addAnswerKeys, adjourn, finish, success, ...)
  - 사용자들의 각 계정 (Kaikas or Klip)으로 approve 된 Quest의 Voting을 수행할 수 있다.

2. 프로젝트 실행 방법
  - 환경 : Node.js (14.x), React,js (17.x), caver (1.6.7, kaikas), klip-sdk (2.0.1, klip), sanity (DB로 사용)

  1) npm install ( 프로젝트의 package.json 위치에서 )
  2) npm start

3. 프로젝트 소스
  - Kaikas의 execute contract 수행 소스 : /api/UseKaikas.js
  - Klip의 execute contract 수행 소스 : /api/UseKlip.js
  - 사이트 내의 페이지
    > Home      > /pages/main/index.js
    > Quest     > /pages/quest/list.js, /pages/quest/view.js
    > Results   > /pages/results/list.js, /pages/results/view.js
    > About     > /pages/about/about.js
    > Community > /pages/community/list.js, /pages/community/view.js
    > Admin     > /pages/market/market.js
  - Voting, Quest Status 변경
    > /pages/market/statusFunctions.js, /pages/quest/createNewQuest.js, /pages/quest/doBetting.js 
  - 사이트 전체 layout
    > /layouts/header.js, /layouts/footer.js
    > header.js에서 사용자의 Cojam balance, Login Modal Context, Klip Qr Modal Context 관리를 하고 있다.

4. Sanity 연동 정보 (주소 : https://cojam.sanity.studio/)
  - Quest : Quests, QuestAnswerList, Season
  - Voting : Betting
  - Results : ResultList
  - Community : CommunityList
  - Reward 정보 : RewardInfo, LoginRewardHistory, JoinRewardHistory
  - Blockchain contract execute history : Transactions
  - 사용자 리스트 : Member
  - 관리자 리스트 : Admin

5. 기타
  - 프로젝트 내의 Quest Key, Betting Key, Answer Key 자동 할당 방법
    > 각각에 해당하는 Sanity의 Document (Quests, Betting, QuestAnswerList) 내의 생성하는 날짜 내의 순번을 따서 생성
     ex) 2022080500000001 -> 2022년 8월 5일 첫번째로 만든 Key
    > 따라서, 날짜가 바뀌면 새로 1번부터 채번해서 생성한다.