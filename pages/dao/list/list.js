import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import Moment from 'moment';

import "react-datepicker/dist/react-datepicker.css";

import { urlFor, client } from "../../../sanity";
import { useLoadingState } from "@assets/context/LoadingContext";
import Pagination from "react-sanity-pagination";

import "react-responsive-modal/styles.css";
import { useWalletData } from '@data/wallet';
import { kaikasLogin, isKaikasUnlocked } from '@api/UseKaikas';
import { checkLogin } from "@api/UseTransactions";

import toastNotify from '@utils/toast';

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

  return (
  <div className="bg-quest">
      <div className="dao-container">
        {/* 카테고리 영역 */}
        <div className="dao-category-section">
          <ul>
            {
              // console.log(`categories`, categories.slice(0, 3))
              categories && categories.slice(1, 4).map((category, index) => (
                <li key={index} className={"swiper-slide " + (category.seasonCategoryName === activeCategory ? 'active' : '')} onClick={() => setActiveCategory(category.seasonCategoryName)} style={{cursor:'pointer'}}>{category.seasonCategoryName}</li>
              ))
            }
          </ul>
        </div>
        {/* 카테고리 영역 끝 */}

        {/* 리스트 시작 */}
        <div className="dao-quest-list-columns">
          {/* Quest 리스트 루프 Start*/}
          <ul className="paginationContent">
          {
            items && items.map((quest, index) => {
              const questTitle = quest.titleKR;
              const category = quest.categoryNm.seasonCategoryName;

              return (
                // eslint-disable-next-line react/jsx-key
                <li>
                  {/* { quest.dDay === 'expired' && <div>CLOSE</div> }
                  { quest.dDay === 'pending' && <div>PENDING</div> } */}
                  <h2>
                    {/* 총 투표수 작성 */}
                    <div>
                      {category} <span>{quest.totalAmount && addComma(quest.totalAmount)}</span>
                    </div>
                    <div className='endtime'>
                      {
                        quest.dDay === 'expired' ? (<div className='closed'>Closed</div>) :
                        quest.dDay === 'pending' ? (<div>PENDING</div>) :
                        (<div>24:00:00</div>)
                      }
                    </div>
                  </h2>
                  <p key={index} 
                  onClick={async () => {
                      if(quest.dDay === 'expired' || quest.dDay === 'pending') {
                        toastNotify({
                          state: 'error',
                          message: 'the quest is closed. (expired or pending)',
                        });
                        return;
                      }

                      let isLogin = false;

                      await checkLogin(walletData).then((res) => {
                        console.log('checkLogin', res);

                        isLogin = res;

                        if(!isLogin) {
                          toastNotify({
                            state: 'error',
                            message: 're login or check lock. please',
                          });

                          return;
                        }

                        history.push({pathname: `/Dao/DaoView`, state: {questId: quest._id}}) 
                      });
                    }}>
                    <span
                      style={{
                        backgroundImage: `url('${quest && (quest.imageFile && quest.imageFile.asset ? urlFor(quest.imageFile) : quest.imageUrl)}')`, 
                        backgroundPosition: `center`,
                        backgroundSize: `cover`,
                      }}
                    ></span>
                  </p>
                  <h3>
                    <div>
                      <div>Begins</div> <span>{quest.startDateTime}</span>
                    </div>
                    <div>
                      <div>Ends</div> <span>{quest.endDateTime}</span>
                    </div>
                  </h3>
                  <h4>{questTitle}</h4>
                  <ul>
                    {
                      quest.answerIds && quest.answerIds.map((answer, index) => (              
                        <li key={index}>
                          <div>{answer.title}</div>
                          <p>{answerAllocations[answer._id] && answerAllocations[answer._id] !== '0%' ? `${answerAllocations[answer._id] || 0} X` : '0%'} </p>
                          <h2>
                            <div style={{ width: `${answerPercents[answer._id] ?? 0}%` }}></div>
                          </h2>
                        </li>
                      ))
                    }
                  </ul>
                  <div className='selectBtn'>
                    <div>Would you like to vote for the Quest Draft?</div>
                    <div>
                      <button onClick={() => {console.log('ApproveBtn')}}>Approve</button>
                      <button onClick={() => {console.log('RejectBtn')}}>Reject</button>
                    </div>
                  </div>
                </li>
              );
            })
          }
          {/* Quest 리스트 루프 End */}
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
      </div>
    </div>
  )
}

function addComma(data) {
  if(!data) return 0;

	return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default Index;
