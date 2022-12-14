import React, { useState, useEffect, useRef } from 'react'; 
import { useHistory } from 'react-router-dom'
import toastNotify from '@utils/toast';

import mainVisualScroll from '@assets/main_visual_scroll02.png'
import mainServiceIcon01 from '@assets/main_service_icon01.svg'
import mainServiceIcon02 from '@assets/main_service_icon02.svg'
import mainServiceIcon03 from '@assets/main_service_icon03.svg'
import mainServiceIcon04 from '@assets/main_service_icon04.svg'
import mainServiceIcon05 from '@assets/main_service_icon05.svg'
import mainServiceIcon06 from '@assets/main_service_icon06.svg'

import phoneBackground from '@assets/main_service_phone.png';
import qnaBackground from '@assets/main_qna_bg.jpg';

import { urlFor, client } from "../../sanity";

import Moment from 'moment';
import { useLoadingState } from "../../assets/context/LoadingContext";
import { useWalletData } from '@data/wallet';
import { checkLogin } from "@api/UseTransactions";
import BackgroundSlider from 'react-background-slider'

import Modal from 'react-modal';
import { useCookies } from 'react-cookie';

const modalStyles = {
  content : {
    width : '500px',
    height: '500px',
	maxWidth: '100%',
	padding: '5px',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
	opacity: 0,
	transition: 'opacity 0.5s',
	backgroundColor: '#000000'
  }
};

function Index() {
	const { walletData } = useWalletData();
	const history = useHistory();
	const { setLoading } = useLoadingState();
	const [ quests, setQuests ] = useState([]);
	const [ mainImages, setMainImages ] = useState([]);
	
	const [ answerTotalAmounts, setAnswerTotalAmounts] = useState({});
	const [ answerPercents, setAnswerPercents] = useState({});
	const [ answerAllocations, setAnswerAllocations ] = useState({});

	/* POPUP MODAL */
	const modalRef = useRef(null);
	const [notOpenToday, setCookie, removeCookie] = useCookies(['notOpenToday']);
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [popupImage, setPopupImage] = useState();
	const openModal = () => {
		modalRef.current.props.style.content.opacity = 1;
		setModalIsOpen(true);
	}

	const afterOpenModal = () => {
		// references are now sync'd and can be accessed.
		/* this.subtitle.style.color = '#f00'; */
	}

	const closeModal = () => {
		setModalIsOpen(false);
	}
	/* //POPUP MODAL */

	const resizeFunc = () => {
		//????????? ?????? ??????
		if(window.innerWidth < 1000) {
			document.querySelector('.main-service-phone').style.background = 'none';
		} else {
			document.querySelector('.main-service-phone').style.background = `url('${phoneBackground}') -280px no-repeat`;
		}
	}

	useEffect(() => {
		window.addEventListener('resize', resizeFunc);
		const loadDatas = async () => {
			const questQuery = `*[_type == 'quests' && isActive == true && pending == false && questStatus == 'APPROVE' && _id != '${Date.now()}'] {..., 'now': now(), 'categoryNm': *[_type=='seasonCategories' && _id == ^.seasonCategory._ref]{seasonCategoryName}[0], 'answerIds': *[_type=='questAnswerList' && questKey == ^.questKey && ^._id != '${Date.now()}'] {title, _id, totalAmount}}[0..5] | order(createdDateTime desc) | order(totalAmount desc)`;
			await client.fetch(questQuery).then((datas) => {
				setQuests(datas);

				datas.forEach((quest) => {
					const diff = Moment(quest.now).diff(Moment(quest.endDateTime), 'days') 
					
					quest.dDay = diff === 0 ? 'D-0' : diff > 0 ? 'expired' : `D${diff}`;
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
				});
			});

			const mainImageQuery = `*[_type == 'pageImages' && pageTitle == 'main' && pageTitle != '${Date.now()}']`;
			await client.fetch(mainImageQuery).then((mainImages) => {
				const mainImageArr = [];
				mainImages.forEach((mainImage) => {
					mainImageArr.push(urlFor(mainImage.pageImage));
				});
				setMainImages(mainImageArr);
			});

			setLoading(false);

			// POP UP
			if(!notOpenToday?.notOpenToday) {
				const popupQuery = `*[_type == 'popup' && isActive == true] | order(createdDateTime desc) [0]`;
				await client.fetch(popupQuery).then((popup) => {
					if(popup) {
						setPopupImage(popup.imageFile);
						openModal();
					}
				});
			}
		}

		setLoading(true);
		loadDatas();

		return () => window.removeEventListener('resize', resizeFunc);
	}, []);

	return (
    	<div>
			<Modal
				isOpen={modalIsOpen}
				onAfterOpen={afterOpenModal}
				onRequestClose={closeModal}
				style={modalStyles}
				contentLabel="COJAM Popup Modal"
				ref={modalRef}
			>
				<div>
					<img src={urlFor(popupImage)} alt="COJAM POPUP" title="" style={{ width: '100%', height: '95%', objectFit: 'cover' }} />
				</div>

				<div style={{ marginTop: '5px' }}>
					<button style={{ float: 'left', color: 'white' }} onClick={() => { setCookie('notOpenToday', true, { path: '/', maxAge: 86400 }); closeModal();}}>Don't open any more today</button>
					<button style={{ float: 'right', color: 'white' }} onClick={closeModal}>close</button>
				</div>
			</Modal>

			{/* ??????????????? */}
			<div className="main-vegas">
				<BackgroundSlider
					images={mainImages}
					duration={10} transition={1} 
				/>

				<div className="mv-btm"><img src={mainVisualScroll} width="30" alt="" title="" /></div>
				<div className="mv-copy">
					<h2>COJAM</h2>
					<h3>Let's enjoy the prediction platform through COJAM</h3>
				</div>
			</div>
			{/* ??????????????? ??? */}

			{/* ????????? ?????? */}
			<div className="container container-main">
				<div className="quest-list-columns">
					<h2>Popular Vote</h2>
					<h3 className="about-content">Convergence Platform of Knowledge based on Prediction</h3>
					<ul>
						{/* Quest ????????? ?????? Start*/}
						{
						quests.map((quest, index) => {
							return (
								<li key={index} onClick={() => {
									if(quest.dDay === 'expired') {
										return;
									}

									let isLogin = false;
									checkLogin(walletData).then((res) => {
										isLogin = res;

										if(!isLogin) {
											toastNotify({
												state: 'error',
												message: 'login please',
											});

											return;
										}

										history.push({pathname: `/QuestView`, state: { questId: quest._id }}) 
									});
								}}>
                					{ quest.dDay === 'expired' && <div>CLOSE</div> }
									<h2>
										Total <span>{quest.totalAmount && addComma(quest.totalAmount)}</span> CT
									</h2>
									<p>
										<span
											style={{
												backgroundImage: `url('${quest && (quest.imageFile && quest.imageFile.asset ? urlFor(quest.imageFile) : quest.imageUrl)}')`, 
												backgroundPosition: `center`,
												backgroundSize: `cover`,
											}}
										></span>
									</p>
									<h3>
										<span>{quest.dDay}</span> {quest.endDateTime}
									</h3>
									<h4>{quest[`titleKR`]}</h4>
									<ul>
									{
										quest.answers && quest.answers.map((answer, index) => (              
											<li key={index}>
												<div>{answer}</div>
												<p>{answerAllocations[answer] && answerAllocations[answer] !== '0%' ? `${answerAllocations[answer]} X` : '0%'} </p>
												<h2><div style={{width:`${answerPercents[answer] ?? 0}%`}}></div></h2>
											</li>
										))
									}
									</ul>
								</li>
							);
						})
						}
						{/* Quest ????????? ?????? End */}
					</ul>
				</div>
			</div>
			{/* ????????? ??? */}


			{/* ????????? */}
			<div className="main-service">
				<div className="main-service-phone" style= {{ background: window.innerWidth < 1000 ? 'none' : `url('${phoneBackground}') -280px no-repeat` }}>
					<h2>Cojam Service</h2>
					<h3>Operate the Service Through Advanced Technology</h3>
					<dl>
						<dt>&nbsp;</dt>
						<dd>
							<div>
								<p>
									<span style={{ backgroundColor: '#fafbff', opacity: 0.5 }}>
										<img src={mainServiceIcon01} alt="" title="" />
									</span>
								</p>
								<h2>AWS Cloud</h2>
								<h3>Our Service based on AWS Cloud Service for Security and Stability.</h3>
							</div>
							<div>
								<p>
									<span style={{ backgroundColor: '#fafbff', opacity: 0.5 }}>
										<img src={mainServiceIcon02} alt="" title="" />
									</span>
								</p>
								<h2>Blockchain</h2>
								<h3>It ensures transparency and stability and can participate in predictive platforms.</h3>
							</div>
							<div>
								<p>
									<span style={{ backgroundColor: '#fafbff', opacity: 0.5 }}>
										<img src={mainServiceIcon03} alt="" title="" />
									</span>
								</p>
								<h2>HTML5 Web Standard</h2>
								<h3>Developed by HTML5 Web Standard to support a variety of browsers.</h3>
							</div>
							<div>
								<p>
									<span style={{ backgroundColor: '#fafbff', color: '#0045f4', opacity: 0.5 }}>
										<img src={mainServiceIcon04} alt="" title="" />
									</span>
								</p>
								<h2>Mobile Application</h2>
								<h3>Any Where! Any Time! You can enjoy with Mobile.</h3>
							</div>
							<div>
								<p>
									<span style={{ backgroundColor: '#fafbff', opacity: 0.5 }}>
										<img src={mainServiceIcon05} alt="" title="" />
									</span>
								</p>
								<h2>Responsible Web</h2>
								<h3>It is possible to participate in services from browsers on various devices through Responsible Web.</h3>
							</div>
							<div>
								<p>
									<span style={{ backgroundColor: '#fafbff', opacity: 0.5 }}>
										<img src={mainServiceIcon06} alt="" title="" />
									</span>
								</p>
								<h2>Realtime Service</h2>
								<h3>If you have any questions about the service, please feel free to contact us.</h3>
							</div>
						</dd>
					</dl>
				</div>
			</div>
			{/* ????????? ??? */}

			
			{/* ???????????? */}
			<div className="main-qna" style={{background: `url('${qnaBackground}') center -50px no-repeat`}}>
				<div>
					<h2>What is COJAM</h2>
					<h3>
						Can you predict? <br/>
						This is a reward-type prediction platform where users who produce content and those <br/>
						who participate solve the answers, compete, and receive compensation based on the results. <br/>
						Start Prediction with COJAM!
					</h3>
				</div>
			</div>
			{/* ???????????? ??? */}
    </div>
  );
}

function addComma(data) {
	if(!data) return '0';

	return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default Index;