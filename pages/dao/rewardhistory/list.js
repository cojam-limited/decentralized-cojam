import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import { Modal } from "react-responsive-modal";
import Moment from 'moment';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { urlFor, client } from "../../../sanity";
import { useLoadingState } from "@assets/context/LoadingContext";
import Pagination from "react-sanity-pagination";
import createNewQuest from '../../quest/createNewQuest';

import "react-responsive-modal/styles.css";
import { useWalletData } from '@data/wallet';
import { kaikasLogin, isKaikasUnlocked } from '@api/UseKaikas';
import { checkLogin } from "@api/UseTransactions";

import toastNotify from '@utils/toast';
import { IPFS } from "caver-js";

function Index() {
  const { walletData } = useWalletData();

  const { setLoading } = useLoadingState();
  const history = useHistory();
  const [ openQuestAdd, modalQuestAdd ] = useState(false);
  const [ openQuestSeason, modalQuestSeason ] = useState(false);

  const [ seasonInfos, setSeasonInfos ] = useState([]);
  const [ categories, setCategories ] = useState([]);
  const [ activeCategory, setActiveCategory ] = useState('All');
  const [ bannerImage, setBannerImage ] = useState();
  const [ selectStatus, setSelectStatus ] = useState('All');

	// pagenation settings
	let postsPerPage = 6;
	const [ items, setItems ] = useState([]);
	const [ itemsToSend, setItemsToSend ] = useState([]);

  const action = (page, range, items) => {
		setItems(items);
	};
	// pagenation settings

  const [ answerTotalAmounts, setAnswerTotalAmounts] = useState({});
  const [ answerPercents, setAnswerPercents] = useState({});
  const [ answerAllocations, setAnswerAllocations ] = useState({});

  // modal values
  const [fileKey, setFileKey] = useState('');
  const [endDateTime, setEndDateTime] = useState(new Date());
  const [modalValues, setModalValues] = useState({'_type': 'quests', 'questType': 'I', 'questLanguage': 'KR', 'endDateTime': endDateTime});
  const [ questLanguage, setQuestlanguage ] = useState('KR');
  const [ questTitleText, setQuestTitleText ] = useState({ KR: { placeholder: "Please enter a title",  content: '' }, });
  // modal values

  const handleOpenKaikasModal = async () => {
    const kaikasUnlocked = await isKaikasUnlocked();
    if (!kaikasUnlocked) {
      const account = await kaikasLogin();
      mutateWalletData({ account: account, type: 'kaikas' });
      mutateModalData({ open: false });
      modalKlipAdd(false);
    }
  }

  const getQuestHistory = async () => {
    setLoading(true);

    const questHistoryQuery = `*[_type == 'quests' && isActive == true  && (statusType == 'SUCCESS' || statusType == 'ADJOURN') && _id != '${Date.now()}'] {..., 'now': now(), 'categoryNm': *[_type=='seasonCategories' && _id == ^.seasonCategory._ref]{seasonCategoryName}[0], 'answerIds': *[_type=='questAnswerList' && questKey == ^.questKey] {title, _id, totalAmount}} | order(createdDateTime desc)`;
    await client.fetch(questHistoryQuery).then((questHistory) => {
      questHistory.forEach((quest) => {
        const diff = Moment(quest.now).diff(Moment(quest.endDateTime), 'days') 
        if(diff === 0) { 
          quest.dDay = 'D-0';
        } else {
          quest.dDay = diff > 0 ? 'expired' : `D${diff}`;
        }

        if(quest.completed) {
          quest.dDay = 'expired';
        }

        if(quest.pending) {
          quest.dDay = 'pending';
        }

        quest.startDateTime = Moment(quest.startDateTime).format('yyyy-MM-DD HH:mm:ss');
        quest.endDateTime = Moment(quest.endDateTime).format('yyyy-MM-DD HH:mm:ss');

        // calculate quest, totalAmount, percent, allocations
        const questTotalAmount = quest.totalAmount;
        const answers = quest.answerIds;
				answers.forEach((answer) => {
					const resultPercent = answer.totalAmount / (questTotalAmount || 1);
					const allocation = isNaN(Number(resultPercent).toFixed(2)) ? '0%' : Number(resultPercent  * 100).toFixed(2) +'% ('+ addComma(answer.totalAmount) +' CT)';
					answerTotalAmounts[answer._id] = answer.totalAmount;
					answerPercents[answer._id] = resultPercent * 100;
					answerAllocations[answer._id] = allocation;

					setAnswerTotalAmounts(answerTotalAmounts);
					setAnswerPercents(answerPercents);
					setAnswerAllocations(answerAllocations);
				});
      });

      setItemsToSend(questHistory);
      setItems(questHistory.slice(0, postsPerPage));
    });
      

    setLoading(false);
  }

  useEffect(() => {
    /**
     * 시즌 카테고리 리스트 조회
     */
		const seasonCategoryQuery = `*[_type == 'season' && isActive == true] {seasonCategories[] -> {seasonCategoryName, _id}}`;
		client.fetch(seasonCategoryQuery).then((datas) => {
      if(datas) {
        const localCategories = [{ seasonCategoryName: 'All' }];
        datas[0].seasonCategories.forEach((category) => ( localCategories.push(category) ));
        setCategories(localCategories);
      }
    });
    /**
     * 시즌 카테고리 리스트 조회
     */

    // banner image 조회
		const imageQuery = `*[_type == 'pageImages' && pageTitle == 'quest'][0]`;
		client.fetch(imageQuery).then((image) => {
      if(image) {
        setBannerImage(image.pageImage);
      }
		});
  }, []);

  useEffect(() => {
    setLoading(true);

    /**
     * Quest 리스트 & 데이터 조회
     */
    let condition = `${activeCategory === 'All' ? '' : `&& seasonCategory._ref in *[_type == "seasonCategories" && seasonCategoryName == '${activeCategory}']._id`}`;
    condition = `${activeCategory === 'Hot Quest' ? '&& hot == true' : condition}`;

    const questQuery = `*[_type == 'quests' && isActive == true && pending == false && questStatus == 'APPROVE' && _id != '${Date.now()}' ${condition}] {..., 'now': now(), 'categoryNm': *[_type=='seasonCategories' && _id == ^.seasonCategory._ref]{seasonCategoryName}[0], 'answerIds': *[_type=='questAnswerList' && questKey == ^.questKey && ^.questKey != '${Date.now()}'] {title, _id, totalAmount}} | order(createdDateTime desc) | order(totalAmount desc)`;
		client.fetch(questQuery).then((datas) => {
      datas.forEach((quest) => {
        const diff = Moment(quest.now).diff(Moment(quest.endDateTime), 'days') 
        if(diff === 0) {
          quest.dDay = 'D-0';
        } else {
          quest.dDay = diff > 0 ? 'expired' : `D${diff}`;
        }

        if(quest.completed) {
          quest.dDay = 'expired';
        }

        quest.startDateTime = Moment(quest.startDateTime).format('yyyy-MM-DD HH:mm:ss');
        quest.endDateTime = Moment(quest.endDateTime).format('yyyy-MM-DD HH:mm:ss');

        // calculate quest, totalAmount, percent, allocations
        const questTotalAmount = quest.totalAmount;
        const answers = quest.answerIds;
				answers.forEach((answer) => {
					const resultPercent = Number(answer.totalAmount) / (Number(questTotalAmount) || 1);
					const allocation = isNaN(Number(resultPercent).toFixed(2)) ? '0%' : Number(resultPercent  * 100).toFixed(2) +'% ('+ addComma(answer.totalAmount) +' CT)';
					
          answerTotalAmounts[answer._id] = Number(answer.totalAmount);
					answerPercents[answer._id] = Number(resultPercent) * 100;
					answerAllocations[answer._id] = allocation; 
		
					setAnswerTotalAmounts(answerTotalAmounts);
					setAnswerPercents(answerPercents);
					setAnswerAllocations(answerAllocations);
				});
      });
      
      setItemsToSend(datas);
      setItems(datas.slice(0, postsPerPage));

      document.querySelectorAll('.pagePagination button').forEach((button) => button.classList.remove("active"));
      document.querySelector('.pagePagination :nth-child(2) > button') && document.querySelector('.pagePagination :nth-child(2) > button').classList.add("active");

      setLoading(false);
		});   
    /**
     * Quest 리스트 & 데이터 조회
     */ 

    // set season info
    const seasonInfoQuery = `*[_type == 'season' && isActive == true] {
      ...,
      'quests': *[_type == 'quests' && ^._id == season._ref && ^._id != '${Date.now()}'] 
      {'categoryName': *[_type == 'seasonCategories' && _id == ^.seasonCategory._ref] {seasonCategoryName} [0] }
    }`;
    client.fetch(seasonInfoQuery).then((seasonInfos) => {
      // category name, percentage
      const categoryAggr = {};
      seasonInfos[0].quests?.forEach((quest) => {
        const categoryName = quest.categoryName.seasonCategoryName;
        categoryAggr[categoryName] = categoryAggr[categoryName] ? Number(categoryAggr[categoryName]) + 1 : 1;
      });

      seasonInfos[0]['categoryAggr'] = categoryAggr;
      setSeasonInfos(seasonInfos);
    });
  }, [activeCategory]);

  const testdata = [
    {
      address: '0x07A6054c6323d501C62B6D125B4c7e56227fE00C',
      title: 'Can Avatar: The Way of Water exceed 400k in the 1st day of release?',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      status: 'Draft Voting',
      categories: ['Draft Voting', 'Success Voting', 'Answer Voting'],
      answer: [
        { answer: 'Yes', vote: '7'},
        { answer: 'No', vote: '3'},
        { answer: 'Abstain', vote: '5'}
      ],
      endTime: '3',
      _id: 1,
      thumbnail: 'https://post-phinf.pstatic.net/MjAyMjA1MTJfMjYz/MDAxNjUyMjgyNDMxNTMx.eiksoWq4rbopryxGcA8kYLbbluZBGmlgAyIqk9IGt5Ig.I7z63dT0QXrlv2VPs1lgrGniY-mDD3T8_PwOwDcSyBEg.PNG/%ED%94%BC%EC%B9%B4%EC%B8%84.png',
    },
    {
      address: '0xf27f5282e41875504636f9A6356eE2984B2CFdFd',
      title: 'Dao Test Second',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      status: 'Success Voting',
      answer: [
        { answer: 'Yes', vote: '4'},
        { answer: 'No', vote: '7'},
        { answer: 'Abstain', vote: '2'}
      ],
      endTime: '3',
      _id: 2,
      thumbnail: 'https://post-phinf.pstatic.net/MjAyMjA1MTJfMjYz/MDAxNjUyMjgyNDMxNTMx.eiksoWq4rbopryxGcA8kYLbbluZBGmlgAyIqk9IGt5Ig.I7z63dT0QXrlv2VPs1lgrGniY-mDD3T8_PwOwDcSyBEg.PNG/%ED%94%BC%EC%B9%B4%EC%B8%84.png',
    },
    {
      address: '0xbB12b62dB8Ef3Be3AfCbf7B3f8806280d165626d',
      title: 'Dao Test Third',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      status: 'Answer Voting',
      answer: [
        { answer: 'Yes', vote: '3'},
        { answer: 'No', vote: '5'},
        { answer: 'Abstain', vote: '1'}
      ],
      endTime: '3',
      _id: 3,
      thumbnail: 'https://post-phinf.pstatic.net/MjAyMjA1MTJfMjYz/MDAxNjUyMjgyNDMxNTMx.eiksoWq4rbopryxGcA8kYLbbluZBGmlgAyIqk9IGt5Ig.I7z63dT0QXrlv2VPs1lgrGniY-mDD3T8_PwOwDcSyBEg.PNG/%ED%94%BC%EC%B9%B4%EC%B8%84.png',
    },
    {
      address: '0x2b51a766F3bFC98C47253e8756EDC90BECDD88cB',
      title: 'Dao Test Fourth',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      status: 'Draft Voting',
      answer: [
        { answer: 'Yes', vote: '5'},
        { answer: 'No', vote: '5'},
        { answer: 'Abstain', vote: '0'}
      ],
      endTime: '3',
      _id: 4,
      thumbnail: 'https://post-phinf.pstatic.net/MjAyMjA1MTJfMjYz/MDAxNjUyMjgyNDMxNTMx.eiksoWq4rbopryxGcA8kYLbbluZBGmlgAyIqk9IGt5Ig.I7z63dT0QXrlv2VPs1lgrGniY-mDD3T8_PwOwDcSyBEg.PNG/%ED%94%BC%EC%B9%B4%EC%B8%84.png',
    }
  ]

  const testCategories = ['Draft Voting', 'Success Voting', 'Answer Voting'];

  // const clickViewHandler = (list) => {
  //   console.log(list)
  //   history.push({
  //     pathname: `/Dao/DaoProposals/View`,
  //     state: {proposalId: list._id}
  //   })
  // }

  const goToCreateProposal = () => {
    history.push('/Dao/DaoProposals/Create')
  }

  const totalCount = testdata.length
  const [activateDelete, setActivateDelete] = useState(false);

  const activateDeleteHandler = () => {
    activateDelete ? setActivateDelete(false) : setActivateDelete(true);
  }

  return (
    <div className="bg-quest">
      <div className="dao-container proposal">
        {/* 카테고리 영역 */}
        <div className="reward-history-section">
          <div>
            <p>Total Reward <span>1/{totalCount}</span></p>
            <button
              onClick={activateDeleteHandler}
            >
              Delete
            </button>
          </div>
        </div>
        {/* 카테고리 영역 끝 */}

        {/* 리스트 시작 */}
        <div className="reward-history-list">
          {/* Proposal 리스트 루프 Start */}
          <ul className="paginationContent">
            <ul className='reward-history-content'>
              {
                testdata.map((list, idx) => {
                  // console.log(list)
                  return (
                    <li key={idx}>
                      {
                        activateDelete ? (
                          <input type="checkbox" id={list.title} name={list.title} />
                        ) : (null)
                      }
                      <label htmlFor={list.title} className={`${activateDelete ? 'activate' : ''}`}>
                        {
                          activateDelete ? (
                            <span className="checkbox"></span>
                          ) : (null)
                        }
                        <div>
                          <h3>
                            Reward 1 NFT
                          </h3>
                          <div>
                            <img src={list.thumbnail} alt="reward-thumbnail" />
                            <div>
                              <p>{list.title}</p>
                              <p>2022-12-31</p>
                            </div>
                          </div>
                        </div>
                      </label>
                    </li>
                  )
                })
              }
            </ul>
          {/* Proposal 리스트 루프 End */}
          </ul>
        </div>
        {/* 리스트 끝 */}

        {/* 페이지네이션 */}
				{
          itemsToSend.length > 0 && 
          <Pagination
						nextButton={true}
						prevButton={true}
						nextButtonLabel={">"}
						prevButtonLabel={"<"}
						items={itemsToSend}
						action={action}
						postsPerPage={postsPerPage}
				  />
        }
				{/* 페이지네이션 끝 */}

        {/* Proposal-footer Start */}
        {
          activateDelete ? (
            <div
              className='reward-history-footer'
              onClick={goToCreateProposal}
            >
              <p>Select All</p>
              <p>Cancel</p>
              <p>Delete</p>
            </div>
          )
          :
          (null)
        }
        {/* Proposal-footer End */}
      </div>
    </div>
  )
}

function addComma(data) {
  if(!data) return 0;

	return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default Index;
