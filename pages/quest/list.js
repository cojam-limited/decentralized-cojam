import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import { Modal } from "react-responsive-modal";
import Moment from 'moment';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { urlFor, client } from "../../sanity";
import backgroundImage from '@assets/body_quest.jpg';
import { useLoadingState } from "@assets/context/LoadingContext";
import Pagination from "react-sanity-pagination";
import createNewQuest from './createNewQuest';``

import "react-responsive-modal/styles.css";


function Index() {
  const { setLoading } = useLoadingState();
  const history = useHistory();
  const [ openQuestAdd, modalQuestAdd ] = useState(false);
  const [ openQuestSeason, modalQuestSeason ] = useState(false);

  const [ seasonInfos, setSeasonInfos ] = useState([]);
  const [ categories, setCategories ] = useState([]);
  const [ activeCategory, setActiveCategory ] = useState('All');

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
  const [endDateTime, setEndDateTime] = useState(new Date());
  const [modalValues, setModalValues] = useState({'_type': 'quests', 'questLanguage': 'EN', 'endDateTime': endDateTime});
  // modal values

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
  }, []);

  useEffect(() => {
    setLoading(true);

    /**
     * Quest 리스트 & 데이터 조회
     */
    const condition = `${activeCategory === 'All' ? '' : `&& seasonCategory._ref in *[_type == "seasonCategories" && seasonCategoryName == '${activeCategory}']._id`}`;
    const questQuery = `*[_type == 'quests' && isActive == true  && statusType == 'APPROVE' ${condition}] {..., 'now': now(), 'categoryNm': *[_type=='seasonCategories' && _id == ^.seasonCategory._ref]{seasonCategoryName}[0], 'answerIds': *[_type=='questAnswerList' && questKey == ^.questKey] {title, _id, totalAmount}}`;
		client.fetch(questQuery).then((datas) => {
      datas.forEach((quest) => {
        const diff = Moment(quest.now).diff(Moment(quest.endDateTime), 'days') 
        if(diff === 0) { 
          quest.dDay = 'D-0';
        } else {
          quest.dDay = diff > 0 ? 'expired' : `D${diff}`;
        }

        quest.startDateTime = Moment(quest.startDateTime).format('yyyy-MM-DD HH:mm:ss');
        quest.endDateTime = Moment(quest.endDateTime).format('yyyy-MM-DD HH:mm:ss');

        const questTotalAmount = quest.totalAmount;
        const answers = quest.answerIds;
				answers.forEach((answer) => {
					const resultPercent = answer.totalAmount / questTotalAmount;
					const allocation = isNaN(Number(resultPercent).toFixed(2)) ? '0%' : Number(resultPercent  * 100).toFixed(2) +'% ('+ addComma(answer.totalAmount) +' CT)';
					answerTotalAmounts[answer.title] = answer.totalAmount;
					answerPercents[answer.title] = resultPercent * 100;
					answerAllocations[answer.title] = allocation;
		
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

    const seasonInfoQuery = `*[_type == 'season' && isActive == true] {
      ...,
      'quests': *[_type == 'quests' && ^._id == season._ref] 
      {'categoryName': *[_type == 'seasonCategories' && _id == ^.seasonCategory._ref] {seasonCategoryName} [0] }
    }`;
    client.fetch(seasonInfoQuery).then((seasonInfos) => {
      // category name, percentage
      const categoryAggr = {};
      seasonInfos[0].quests?.forEach((quest) => {
        const categoryName = quest.categoryName.seasonCategoryName;
        categoryAggr[categoryName] = categoryAggr[categoryName] ? Number(categoryAggr[categoryName]) + 1 : 1;
      });

      seasonInfos[0]['caregoryAggr'] = categoryAggr;
      setSeasonInfos(seasonInfos);
    });
  }, [activeCategory]);

  return (
  <div className="bg-quest" style={{background: `url('${backgroundImage}') center -150px no-repeat, #fff`}}>
      {/* 기본영역 (타이틀/네비/버튼) */}
      <dl className="title-section">
        <dt>
          <h2>{activeCategory}</h2>
          <h3>
            <i className="uil uil-estate"></i> Home · Quest ·{" "}
            <span>{activeCategory}</span>
          </h3>
        </dt>
        <dd>
          <Link to="#" onClick={() => modalQuestAdd(true)}>
            <i className="uil uil-plus-circle"></i>{" "}
            <span>Create New Prediction</span>
          </Link>
          <Link to="#" onClick={() => modalQuestSeason(true)}>
            <i className="uil uil-info-circle"></i> <span>Season Info</span>
          </Link>
        </dd>
      </dl>
      {/* 기본영역 끝 */}

      <div className="container">
        {/* 카테고리 영역 */}
        <div className="category-section">
          <dl>
            <dt>
              <Swiper
                className="swiper-wrapper"
                spaceBetween={10}
                slidesPerView={"auto"}
              >
                {
                  categories && categories.map((category, index) => (
                    <SwiperSlide key={index} className={"swiper-slide " + (category.seasonCategoryName === activeCategory ? 'active' : '')} onClick={() => setActiveCategory(category.seasonCategoryName)} style={{cursor:'pointer'}}>{category.seasonCategoryName}</SwiperSlide>
                  ))
                }
              </Swiper>
            </dt>
            <dd>
              <Link to="#">
                <i className="uil uil-history"></i>
                <span>History</span>
              </Link>
            </dd>
          </dl>
        </div>
        {/* 카테고리 영역 끝 */}

        {/* 리스트 시작 */}
        <div className="quest-list-columns">
          {/* Quest 리스트 루프 Start*/}
          <ul className="paginationContent">
          {
            items && items.map((quest, index) => {
              return (
                <li key={index} onClick={() => { if(quest.dDay === 'expired') {return;} history.push({pathname: `/QuestView`, state: {questId: quest._id}}) }}>
                  { quest.dDay === 'expired' && <div>CLOSE</div> }
                  <h2>
                    Total <span>{quest.totalAmount && addComma(quest.totalAmount)}</span> CT
                  </h2>
                  <p>
                    <span
                      style={{
                        backgroundImage: quest.imageFile && `url('${urlFor(quest.imageFile)}')`,
                        backgroundPosition: `center`,
                        backgroundSize: `cover`,
                      }}
                    ></span>
                  </p>
                  <h3>
                    <span>{quest.dDay}</span> {quest.endDateTime}
                  </h3>
                  <h4>{quest.title}</h4>
                  <ul>
                    {
                      quest.answers && quest.answers.map((answer, index) => (              
                        <li key={index}>
                          <div>{answer}</div>
                          <p>{answerAllocations[answer]} X</p>
                          <h2>
                            <div style={{ width: `${answerPercents[answer]}%` }}></div>
                          </h2>
                        </li>
                      ))
                    }
                  </ul>
                </li>
              );
            })
          }
          {/* Quest 리스트 루프 End */}
          </ul>
        </div>
        {/* 리스트 끝 */}

        {/* 페이지네이션 */}
				<Pagination
						nextButton={true}
						prevButton={true}
						nextButtonLabel={">"}
						prevButtonLabel={"<"}
						items={itemsToSend}
						action={action}
						postsPerPage={postsPerPage}
				/>
				{/* 페이지네이션 끝 */}


          {/* 등록버튼 */}
        <div className="add-btn">
          <Link to="#" onClick={() => modalQuestAdd(true)}>
            <i className="uil uil-plus"></i>
          </Link>
        </div>
        {/* 등록버튼 끝 */}

        {/* 모달 - 퀘스트 등록 */}
        <Modal open={openQuestAdd} onClose={() => modalQuestAdd(false)} center>
          <div className="modal-quest-add">
            <form name="addForm" method="post" action="">
              <fieldset>
                <legend>등록</legend>
                <div className="mqa-area">
                  <dl className="mqa-header">
                    <dt>Create New Prediction</dt>
                    <dd onClick={() => modalQuestAdd(false)}>
                      <i className="uil uil-times"></i>
                    </dd>
                  </dl>
                  <ul className="mqa-content2">
                    <li key='1'>
                      <select className="w100p" name="languageSelect" onChange={(e) => setModalValues({...modalValues, 'questLanguage': e.target.value})}>
                        <option value="EN">&nbsp;🇺🇸&nbsp;&nbsp;English</option>
                        <option value="KR">&nbsp;🇰🇷&nbsp;&nbsp;Korean</option>
                        <option value="CH">&nbsp;🇨🇳&nbsp;&nbsp;Chinese</option>
                      </select>
                    </li>
                    <li key='2'>
                      <textarea
                        name="title"
                        type="text"
                        className="w100p"
                        placeholder="Please enter a title(English)"
                        onChange={(e) => setModalValues({...modalValues, 'title': e.target.value})}
                      ></textarea>
                    </li>
                    <li key='3'>
                      <select name="name" title="" className="w100p" defaultValue="" onChange={(e) => setModalValues({...modalValues, 'seasonCategory': { _type: 'reference', _ref: e.target.value }})}>
                        <option value="">
                          Please select a category
                        </option>
                        {
                          categories?.filter((category) => category.seasonCategoryName !== 'All').map((category, index) => (
                            <option key={index} value={category._id}>{category.seasonCategoryName}</option>
                          ))
                        }
                      </select>
                    </li>
                    <li key='4'>
                      <DatePicker
                        dateFormat="yyyy-MM-dd HH:mm:ss"
                        selected={endDateTime}
                        onChange={(date) => {setEndDateTime(date); setModalValues({...modalValues, 'endDateTime': date});}}
                        showTimeInput
                      />
                    </li>
                    <li key='5'>
                      <select name="questType" title="" className="w100p" onChange={(e) => setModalValues({...modalValues, 'questType': e.target.files})} >
                        <option value="I" selected>
                          Image
                        </option>
                        <option value="S">SNS url</option>
                      </select>
                    </li>
                    <li key='6'>
                      <div className="input-file">
                        <label>
                          File Attach
                          <input type="file" onChange={(e) => setModalValues({...modalValues, 'imageFile': e.target.files})} />
                        </label>
                        &nbsp;
                        <input
                          type="text"
                          readOnly="readOnly"
                          title="File Route"
                          id="fileRoute"
                          placeholder="Attach an image"
                          onChange={(e) => setModalValues({...modalValues, 'fileKey': e.target.value})}
                        />
                      </div>
                    </li>
                    <li key='7'>
                      <input
                        name="name"
                        type="text"
                        className="w100p"
                        placeholder="Enter the image link"
                        onChange={(e) => setModalValues({...modalValues, 'snsUrl': e.target.value})}
                      />
                    </li>
                  </ul>
                  <ol className="mqa-content1">
                    <li key='1'>Select a Type</li>
                    <li key='2'>
                      <Link to="#">
                        <i className="uil uil-plus-circle" onClick={() => { if(document.querySelectorAll('.mqa-answers li').length > 5) {return;} document.querySelector('.mqa-answers').insertAdjacentHTML('beforeend', `<li> <input name="name" type="text" className="w100p" style="width: 100%" placeholder="" /> </li>`)}}></i>
                      </Link>
                      <Link to="#">
                        <i className="uil uil-minus-circle"onClick={() => { if(document.querySelectorAll('.mqa-answers li').length < 2) {return;} document.querySelector('.mqa-answers').removeChild(document.querySelector('.mqa-answers').lastChild)}}></i>
                      </Link>
                    </li>
                  </ol>
                  <ul className="mqa-content2 mqa-answers">
                    <li key='1'> 
                      <input
                        name="name"
                        type="text"
                        className="w100p"
                        placeholder=""
                      />
                    </li>
                    <li key='2'>
                      <input
                        name="name"
                        type="text"
                        className="w100p"
                        placeholder=""
                      />
                    </li>
                  </ul>
                  <p className="mqa-btn">
                    <Link to="#" onClick={() => createNewQuest(modalValues, document.querySelectorAll('.mqa-answers li input'))}>Complete</Link>
                  </p>
                </div>
              </fieldset>
            </form>
          </div>
        </Modal>
        {/* 모달 - 퀘스트 등록 끝 */}

        {/* 모달 - 퀘스트 시즌 */}
        <Modal
          open={openQuestSeason}
          onClose={() => modalQuestSeason(false)}
          center
        >
          <div className="modal-quest-season">
            <div className="mqs-area">
              <dl className="mqs-header">
                <dt>Create Season of COJAM Service!</dt>
                <dd onClick={() => modalQuestSeason(false)}>
                  <i className="uil uil-times"></i>
                </dd>
              </dl>
              {
                seasonInfos?.map((seasonInfo) => (
                  <>
                    <div className="mqs-date">
                    <i className="uil uil-calendar-alt"></i> {Moment(seasonInfo.startDate).format('YYYY-MM-DD HH:mm:ss')} ~ {Moment(seasonInfo.endDate).format('YYYY-MM-DD HH:mm:ss')}
                    ({ Moment(seasonInfo.endDate).diff(Moment(seasonInfo.startDate), 'days')})
                    </div>

                    <ul className="mqs-content">
                      {
                        categories?.map((category, index) => (
                          <li key={index}>
                            <h3>{category.seasonCategoryName}</h3>
                            <div>
                              <div style={{ width: `${seasonInfo.caregoryAggr && seasonInfo.caregoryAggr[category.seasonCategoryName] || 0}%` }}></div>
                              <p>{seasonInfo.caregoryAggr && seasonInfo.caregoryAggr[category.seasonCategoryName] || 0} / 100</p>
                            </div>
                          </li>
                        ))
                      }
                    </ul>

                    <div className="mqs-info">
                      <h2>Title : {seasonInfo.title}</h2>
                      <h2>Description : {seasonInfo.description}</h2>
                      <div>
                        COJAM Fee : <span>{seasonInfo.cojamFee}%</span>
                        <br />
                        Charity Fee : <span>{seasonInfo.charityFee}%</span>
                        <br />
                        Creator Fee : <span>{seasonInfo.creatorFee}%</span>
                        <br />
                        Creator Pay : <span>{addComma(seasonInfo.creatorPay)} CT</span>
                        <br />
                        Minimum Pay : <span>{addComma(seasonInfo.minimumPay)} CT</span>
                        <br />
                        Maximum Pay : <span>{addComma(seasonInfo.maximumPay)} CT</span>
                      </div>
                    </div>
                  </>                  
                ))  
              }
            </div>
          </div>
        </Modal>
        {/* 모달 - 퀘스트 시즌 끝 */}

      </div>
    </div>
  )
}

function addComma(data) {
  if(!data) return '';

	return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default Index;
