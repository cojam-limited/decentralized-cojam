import React, { useState, useEffect } from 'react'; 
import { useHistory } from 'react-router-dom'

import mainVisualScroll from '@assets/image/content/main_visual_scroll02.png'
// import mainQuestIcon01 from '../../assets/image/content/main_quest_icon01.svg'
// import mainQuestIcon02 from '../../assets/image/content/main_quest_icon02.svg'
// import mainQuestIcon03 from '../../assets/image/content/main_quest_icon03.svg'
// import mainQuestIcon04 from '../../assets/image/content/main_quest_icon04.svg'
// import mainQuestIcon05 from '../../assets/image/content/main_quest_icon05.svg'
// import mainQuestIcon06 from '../../assets/image/content/main_quest_icon06.svg'
import mainServiceIcon01 from '@assets/image/content/main_service_icon01.svg'
import mainServiceIcon02 from '@assets/image/content/main_service_icon02.svg'
import mainServiceIcon03 from '@assets/image/content/main_service_icon03.svg'
import mainServiceIcon04 from '@assets/image/content/main_service_icon04.svg'
import mainServiceIcon05 from '@assets/image/content/main_service_icon05.svg'
import mainServiceIcon06 from '@assets/image/content/main_service_icon06.svg'

import mainBackGround from '@assets/main_visual_img02.jpg';
import serviceBackground from '@assets/image/content/main_service_bg.png';
import phoneBackground from '@assets/image/content/main_service_phone.png';
import qnaBackground from '@assets/image/content/main_qna_bg.jpg';

import { urlFor, client } from "../../sanity";

import Moment from 'moment';
import Accordion from '../../components/Accordion';
//import { useLoadingState } from "@assets//LoadingContext";

function Index() {
	const history = useHistory();
	//const { setLoading } = useLoadingState();
	const [ quests, setQuests ] = useState([]);
	const [ qnas, setQnas ] = useState([]);
	
	const [ answerTotalAmounts, setAnswerTotalAmounts] = useState({});
	const [ answerPercents, setAnswerPercents] = useState({});
	const [ answerAllocations, setAnswerAllocations ] = useState({});

	useEffect(() => {
		const loadDatas = async () => {
			const questQuery = `*[_type == 'quests' && isActive == true] {..., 'now': now(), 'categoryNm': *[_type=='seasonCategories' && _id == ^.seasonCategory._ref]{seasonCategoryName}[0], 'answerIds': *[_type=='questAnswerList' && questKey == ^.questKey] {title, _id, totalAmount}}`;
			await client.fetch(questQuery).then((datas) => {
				console.log('quest', datas);
				setQuests(datas);

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
						const allocation = isNaN(Number(resultPercent).toFixed(2)) ? '0%' : Number(resultPercent * 100).toFixed(2)+'% ('+ addComma(answer.totalAmount) +' CT)';
						
						answerTotalAmounts[answer.title] = answer.totalAmount;
						answerPercents[answer.title] = resultPercent * 100;
						answerAllocations[answer.title] = allocation;
			
						setAnswerTotalAmounts(answerTotalAmounts);
						setAnswerPercents(answerPercents);
						setAnswerAllocations(answerAllocations);
					});

					console.log(answerTotalAmounts, answerPercents, answerAllocations);
				});
			});

			const qnaQuery = '*[_type == "questions"]';
			await client.fetch(qnaQuery).then((data) => {
				console.log('qna', data);
				setQnas(data);
			});
		}

		//setLoading(true);
		loadDatas();
		//setLoading(false);
	}, []);

	return (
    	<div>
			{/* 비주얼영역 */}
			<div className="main-vegas" >
				<img src={mainBackGround} />
				<div className="mv-btm"><img src={mainVisualScroll} width="30" alt="" title="" /></div>
				<div className="mv-copy">
					<h2>COJAM</h2>
					<h3>Let's enjoy the prediction platform through COJAM</h3>
				</div>
			</div>
			{/* 비주얼영역 끝 */}


			{/* 리스트 끝 */}
			<div className="container container-main">
				<div className="quest-list-columns">
					<h2>Popular Vote</h2>
					<h3>Convergence Platform of Knowledge based on Prediction</h3>
					<ul>
						{/* Quest 리스트 루프 Start*/}
						{ 
						quests.map((quest, index) => {
							return (
								<li key={index} onClick={() => { if(quest.dDay === 'expired') {return;} history.push({ pathname: `/QuestView`, state: {quest: quest, answerTotalAmounts: answerTotalAmounts, answerPercents: answerPercents, answerAllocations: answerAllocations}}) }}>
                					{ quest.dDay === 'expired' && <div>CLOSE</div> }
									<h2>
										Total <span>{quest.totalAmount && addComma(quest.totalAmount)}</span> CT
									</h2>
									<p>
										<span
										style={{
											backgroundImage: quest.imageFile && quest.imageFile.length != 0 && `url('${urlFor(quest.imageFile)}')`,
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
			</div>
			{/* 리스트 끝 */}


			{/* 퀘스트 - 카타고리 */}
			{/* <div className="main-quest">
				<div>
					<h2>Ongoing Vote 6</h2>
					<h3>Convergence Platform of Knowledge based on Prediction</h3>
					<ul>
						<li>
							<p><img src={mainQuestIcon01} width="90" alt="" title="" /> </p>
							<h2>Art & Culture</h2>
							<h3>Add your opinion to the new daily predictive Ground and you get COJAM Point(CP)!</h3>
						</li>
						<li>
							<p><img src={mainQuestIcon02} width="90" alt="" title="" /> </p>
							<h2>Community</h2>
							<h3>Add your opinion to the new daily predictive Ground and you get COJAM Point(CP)!</h3>
						</li>
						<li>
							<p><img src={mainQuestIcon03} width="90" alt="" title="" /></p>
							<h2>Competition</h2>
							<h3>Add your opinion to the new daily predictive Ground and you get COJAM Point(CP)!</h3>
						</li>
						<li>
							<p><img src={mainQuestIcon04} width="90" alt="" title="" /></p>
							<h2>Crowd Solving</h2>
							<h3>Add your opinion to the new daily predictive Ground and you get COJAM Point(CP)!</h3>
						</li>
						<li>
							<p><img src={mainQuestIcon05} width="90" alt="" title="" /></p>
							<h2>Economy</h2>
							<h3>Add your opinion to the new daily predictive Ground and you get COJAM Point(CP)!</h3>
						</li>
						<li>
							<p><img src={mainQuestIcon06} width="90" alt="" title="" /></p>
							<h2>Sience</h2>
							<h3>Add your opinion to the new daily predictive Ground and you get COJAM Point(CP)!</h3>
						</li>
					</ul>
				</div>
			</div> */}
			{/* 퀘스트 - 카타고리 끝 */}


			{/* 시즌 */}
			{/* <div className="main-season">
				<div>
					<h2>Cojam Active Season</h2>
					<h3>Create Season of Cojam Service!</h3>
					<ul>
						<li>
							<div>
								<h2>128</h2>
								<h3>Day</h3>
							</div>
						</li>
						<li>
							<div>
								<h2>25</h2>
								<h3>Charity Fee(%)</h3>
							</div>
						</li>
						<li>
							<div>
								<h2>69</h2>
								<h3>Charity Fee(%)</h3>
							</div>
						</li>
						<li>
							<div>
								<h2>17</h2>
								<h3>Cojam Fee(%)</h3>
							</div>
						</li>
					</ul>
				</div>
			</div> */}
			{/* 시즌 끝 */}


			{/* 공지사항 */}
			{/* <div className="main-notice">
				<div>
					<h2>Notice & News</h2>
					<h3>Sharing News, Issues, Histories of COJAM!</h3>
					<ul>
						<li className="item">
							<p>
								<span style={{ backgroundImage: `url('https://i.pinimg.com/564x/7b/ca/5d/7bca5db2b4767e9e0c9440142e6f65bf.jpg')`, backgroundPosition: `center`, backgroundSize: `cover` }}></span>
							</p>
							<div>
								<dl>
									<dt><i className="uil uil-calendar-alt"></i> 2021.01.10 10:00</dt>
									<dd><span>Notice</span></dd>
									<dd><em>News</em></dd>
								</dl>
								<h2>Simple Manual Of Cojam Service</h2>
							</div>
						</li>
						<li className="item">
							<p>
								<span style={{ backgroundImage: `url('https://i.pinimg.com/564x/7b/ca/5d/7bca5db2b4767e9e0c9440142e6f65bf.jpg')`, backgroundPosition: `center`, backgroundSize: `cover` }}></span>
							</p>
							<div>
								<dl>
									<dt><i className="uil uil-calendar-alt"></i> 2021.01.10 10:00</dt>
									<dd><em>News</em></dd>
								</dl>
								<h2>블록체인 예측시스템 코잼, 블록체인 혁신을 실험한다</h2>
							</div>
						</li>
						<li className="item">
							<p>
								<span style={{ backgroundImage: `url('https://i.pinimg.com/564x/7b/ca/5d/7bca5db2b4767e9e0c9440142e6f65bf.jpg')`, backgroundPosition: `center`, backgroundSize: `cover` }}></span>
							</p>
							<div>
								<dl>
									<dt><i className="uil uil-calendar-alt"></i> 2021.01.10 10:00</dt>
									<dd><em>News</em></dd>
								</dl>
								<h2>블록체인 예측시스템 플랫폼 코잼, 손흥민 득점 순위 예측 진행</h2>
							</div>
						</li>
					</ul>
					<div><Link to="/">More</Link></div>
				</div>


.main-service {width:100%; background:url('@assets/main_service_bg.png') center -50px no-repeat;}
.main-service > div {width:1300px; margin:0 auto; padding:170px 0 100px 0; background:url('@assets/main_service_phone.png') -280px 80px no-repeat; overflow:hidden;}

			</div> */}
			{/* 공지사항 끝 */}



			{/* 서비스 */}
			<div className="main-service" style={{background: `url('${serviceBackground}') center no-repeat;`}}>
				<div style= {{background: `url('${phoneBackground}') center no-repeat;`}} >
					<h2>Cojam Service</h2>
					<h3>Operate the Service Through Advanced Technology</h3>
					<dl>
						<dt>&nbsp;</dt>
						<dd>
							<div>
								<p>
									<span><img src={mainServiceIcon01} alt="" title="" /></span>
								</p>
								<h2>AWS Cloud</h2>
								<h3>Our Service based on AWS Cloud Service for Security and Stability.</h3>
							</div>
							<div>
								<p>
									<span><img src={mainServiceIcon02} alt="" title="" /></span>
								</p>
								<h2>Blockchain</h2>
								<h3>It ensures transparency and stability and can participate in predictive platforms.</h3>
							</div>
							<div>
								<p>
									<span><img src={mainServiceIcon03} alt="" title="" /></span>
								</p>
								<h2>HTML5 Web Standard</h2>
								<h3>Developed by HTML5 Web Standard to support a variety of browsers.</h3>
							</div>
							<div>
								<p>
									<span><img src={mainServiceIcon04} alt="" title="" /></span>
								</p>
								<h2>Mobile Application</h2>
								<h3>Any Where! Any Time! You can enjoy with Mobile.</h3>
							</div>
							<div>
								<p>
									<span><img src={mainServiceIcon05} alt="" title="" /></span>
								</p>
								<h2>Responsible Web</h2>
								<h3>It is possible to participate in services from browsers on various devices through Responsible Web.</h3>
							</div>
							<div>
								<p>
									<span><img src={mainServiceIcon06} alt="" title="" /></span>
								</p>
								<h2>Realtime Service</h2>
								<h3>If you have any questions about the service, please feel free to contact us.</h3>
							</div>
						</dd>
					</dl>
				</div>
			</div>
			{/* 서비스 끝 */}

			
			{/* 질문답변 */}
			<div className="main-qna" style={{background: `url('${qnaBackground}') center -50px no-repeat;`}}>
				<div>
					<h2>Q&A</h2>
					<h3>If you have any other questions, please feel free to ask us!</h3>
					<div className="qna_list">
						{
							qnas && qnas.map((qna, index) => (
								<Accordion key={index} title={qna.title} content={qna.content} />
							))
						}
					</div>
				</div>
			</div>
			{/* 질문답변 끝 */}
		

			{/* 레이어팝업 */}
			{/* <div className="main-popup" style={{ top: `100px`, left: `100px` }}>
				<div><img src="https://i.pinimg.com/564x/c8/fc/e2/c8fce2fb4b69a2038471688d8e99d3d8.jpg" alt="" title="" /></div>
				<dl>
					<dt>오늘 더 이상 열지 않기</dt>
					<dd>닫기</dd>
				</dl>
			</div> */}
			{/* 레이어팝업 끝 */}



    </div>
  );
}

function addComma(data) {
	return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default Index;
