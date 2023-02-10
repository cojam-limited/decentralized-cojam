import React, { useRef, useState, useEffect, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom'

import { checkLogin } from "@api/UseTransactions";
import "react-datepicker/dist/react-datepicker.css";
import Moment from 'moment';
import { useLoadingState } from "@assets/context/LoadingContext";

import 'swiper/css';
import 'react-responsive-modal/styles.css';

import doBetting from './doBetting';
import { urlFor, client } from "../../sanity";
import { useWalletData } from '@data/wallet';

import { callGetCojamBalance } from '../../api/UseTransactions';
import { BalanceContext } from '../../components/Context/BalanceContext';

import backgroundImage from '@assets/body_quest.jpg';

import toastNotify from '@utils/toast';
import { QrContext } from '../../components/Context/QrContext';

function Index(props) {
	const history = useHistory();

	if(!props?.location?.state?.questId) {
		toastNotify({
			state: 'error',
			message: 'wrong access.',
		});

		history.push('/');
	}

	const { setQr, setQrModal, setMinutes, setSeconds } = useContext(QrContext);

	const { balance, setBalance } = useContext(BalanceContext);
	const { setLoading } = useLoadingState();
	const [ selectedAnswer, setSelectedAnswer ] = useState();
	const { walletData, mutateWalletData } = useWalletData();

	const [ questId ] = useState(props?.location?.state?.questId);
	const [ quest, setQuest ] = useState();
	const [ questTotalAmount, setQuestTotalAmount ] = useState();
	const [ answerTotalAmounts, setAnswerTotalAmounts ] = useState({});
	const [ answerPercents, setAnswerPercents ] = useState({});
	const [ answerAllocations, setAnswerAllocations ] = useState({});

	const [ bettingCoin, setBettingCoin ] = useState(1);
	const [ rate, setRate ] = useState(0);
	const [ receiveToken, setReceiveToken ] = useState(0);
	const [ answerHistory, setAnswerHistory ] = useState();

	const topRef = useRef(null);

	const setBetting = async () => {
		setLoading(true);
		if(!selectedAnswer) {
			toastNotify({
				state: 'error',
				message: 'choose the answer !',
			});
			setLoading(false);
			return;
		}

		try {
			const questAnswerId = quest.answerIds.filter((answerId) => answerId.title === selectedAnswer);

			let curBalance = await callGetCojamBalance(walletData);
			const betting = {
				'bettingCoin': Number(bettingCoin),
				'spenderAddress': '',
				'transactionId': '',
				'bettingStatus': '',
				'questKey': quest?.questKey,
				'questAnswerKey': questAnswerId[0],
				'memberKey': String(walletData.account).toLowerCase(),
				'receiveAddress': '',
				'answerTitle': selectedAnswer,
				'curBalance': curBalance,
				'multiply': rate,
				'predictionFee': receiveToken
			}

			const betResult = await doBetting(betting, walletData, setQr, setQrModal, setMinutes, setSeconds, setLoading);
			
			toastNotify({
				state: betResult.result ? 'success' : 'error',
				message: `${betResult.message}`,
			});
			
			if(betResult.result) {
				const cojamBalance = await callGetCojamBalance(walletData);
				if(cojamBalance !== balance) {
					setBalance(cojamBalance);
				}

				window.location.reload();
			}
		} catch(error) {
			toastNotify({
				state: 'error',
				message: `Voting failed.`,
			});
		}

		setLoading(false);
	}

	const scrollToTop = (event) => {
		document.getElementById("root").scrollTo(0, 0);
	};

	useEffect(() => {
		/* checkLogin(walletData).then((res) => {
			const isLogin = res;

			if(!isLogin) {
				toastNotify({
					state: 'error',
					message: 're login or check lock. please',
				});
				history.push('/');
			}
		}); */

		/**
		 * set scroll on top
		 */
		const element = topRef.current;
		const scrollableContainer = document.body;

		scrollableContainer.scrollTop = element.offsetTop;
	}, []);

	useEffect(() => {
		setLoading(true);
		/**
		 * Quest 리스트 & 데이터 조회
		 */
		if(!questId) {
			toastNotify({
				state: 'error',
				message: 'error. pick the quest again. please',
			});

			setLoading(false);
			return;
		}

		const questQuery = `*[_type == 'quests' && isActive == true && _id == '${questId}' && pending == false && _id != '${Date.now()}'] {..., 'now': now(), 'categoryNm': *[_type=='seasonCategories' && _id == ^.seasonCategory._ref]{seasonCategoryName}[0], 'answerIds': *[_type=='questAnswerList' && questKey == ^.questKey && ^._id != '${Date.now()}'] {title, _id, totalAmount}} [0]`;
		client.fetch(questQuery).then((quest) => {
			const diff = Moment(quest.now).diff(Moment(quest.endDateTime), 'days');
			if(diff === 0) { 
				quest.dDay = 'D-0';
			} else if (diff > 0) {
				toastNotify({
					state: 'error',
					message: 'quest has been completed.',
				});

				history.push('/');
			} else {
				quest.dDay = `D${diff}`;
			}

			quest.startDateTime = Moment(quest.startDateTime).format('yyyy-MM-DD HH:mm:ss');
			quest.endDateTime = Moment(quest.endDateTime).format('yyyy-MM-DD HH:mm:ss');

			setQuest(quest);
			setQuestTotalAmount(quest.totalAmount);
			setSelectedAnswer(quest.answers[0]);

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

			const creteriaDate = Moment().subtract(5, 'days').format('YYYY-MM-DD');
			const answerHistoryQuery = `*[_type == 'betting' && questKey == ${quest.questKey} && createdDateTime > '${creteriaDate}' && _id != '${Date.now()}'] {..., 'answerColor': *[_type=='questAnswerList' && questKey == ^.questKey && _id == ^.questAnswerKey && ^._id != '${Date.now()}']{color}[0] } | order(_updatedAt desc)`;
			client.fetch(answerHistoryQuery).then((answerHist) => {
				setAnswerHistory(answerHist);
			});

			mutateWalletData({ ...walletData });
			setLoading(false);
		});  
		/**
		 * Quest 리스트 & 데이터 조회
		 */ 
	}, []);

	useEffect(() => {
		if(!bettingCoin) {
			setBettingCoin(1);
		}

		const currentRate = Number(bettingCoin) / (Number(bettingCoin) + Number(answerTotalAmounts[selectedAnswer]));
		const returnToken = (questTotalAmount - answerTotalAmounts[selectedAnswer]) * currentRate;
		const getToken = Number(bettingCoin) + Number(returnToken);
		const calRate = Number(getToken) / Number(bettingCoin);

		const rateString = isNaN(Number(calRate).toFixed(1)) ? '-' : Number(calRate).toFixed(1);
		const tokenString = isNaN(Number(getToken)) ?  '-' : Number(getToken).toFixed(2);

		setRate(rateString);
		setReceiveToken(tokenString);
	}, [selectedAnswer, bettingCoin]);

  	return (
		<div className="bg-quest" style={{background: `url('${backgroundImage}') center -150px no-repeat`}}>
			<div ref={topRef} />

			{/* 기본영역 (타이틀/네비/버튼) */}
			<dl className="title-section">
				<dt>
					<h2>{quest?.category}</h2>
					<h3><i className="uil uil-estate"></i> Home · <span>{quest?.category}</span></h3>
				</dt>
			</dl>
			{/* 기본영역 끝 */}

			<div className="container">
				{/* 상세 */}
				<div className="quest-view">
					{
						quest?.snsUrl && quest?.questType === 'S' &&
						<div>
							<h2>{quest?.titleKR}</h2>
							<p>
								<iframe 
									width="100%" 
									height="650"
									src={`https://www.youtube.com/embed/${quest.snsId}?autoplay=1&mute=1`}
									allow="accelerometer; autoPlay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
									allowFullScreen
								/>
							</p>
						</div>
					}

					{
						quest?.questType !== 'S' &&
						<div>
							<h2>{quest?.titleKR}</h2>
							<p>
								<div
									onClick={() => {
										if(quest?.imageLink && quest?.imageLink !== '') {
											const toUrl = quest?.imageLink.indexOf('http') === -1 
														? `https://${quest?.imageLink}` 
														: `${quest?.imageLink}`;

											window.open(toUrl, '_blank').focus();
										} 
									}} 

									style={{ 
										width: '100%',
										height: '100%',
										cursor: quest?.imageLink ? 'pointer' : '', 
										backgroundImage: `url('${quest && (quest.imageFile && quest.imageFile.asset ? urlFor(quest.imageFile) : quest.imageUrl)}')`, 
										backgroundPosition: `center`, 
										backgroundSize: `cover` 
									}}
								>
								</div>
							</p>
						</div>
					}
					<dl>
						<dt>
							<h2><span>{quest?.dDay}</span> {quest?.endDateTime}</h2>
							
							<p 
								onClick={() => {
									if(quest?.imageLink && quest?.imageLink !== '') {
										const toUrl = quest?.imageLink.indexOf('http') === -1 
													? `https://${quest?.imageLink}` 
													: `${quest?.imageLink}`;

										window.open(toUrl, '_blank').focus();
									} 
								}} 

								style={{ 
									cursor: quest?.imageLink ? 'pointer' : '', 
									backgroundImage: `url('${quest && (quest.imageFile && quest.imageFile.asset ? urlFor(quest.imageFile) : quest.imageUrl)}')`, 
									backgroundPosition: `center`, 
									backgroundSize: `cover` 
								}}
							/>	
							
							<h3>Odds : <span>{rate} X</span></h3>
							<h3>Win : <span>{receiveToken}</span> CT if right</h3>
							<ul>
							{
								quest?.answers && quest.answers.map((answer, index) => (
									<li key={index} onClick={() => setSelectedAnswer(answer)} style={{cursor:'pointer'}} className={`${selectedAnswer == answer && 'active'}`}>
										<div>{answer}</div>
										<p>{answerAllocations[answer] && answerAllocations[answer] !== '0%' ? `${answerAllocations[answer]} X` : '0%'} </p>
										<h2><div style={{width:`${answerPercents[answer] ?? 0}%`}}></div></h2>
									</li>
								))
							}
							</ul>
							<div>
								<form name="searchForm" method="post" action="">
									<fieldset>
										<legend>CT</legend>
										<p><input type="text" name="string" title="CT" defaultValue="" placeholder="CT Input" onChange={(e) => setBettingCoin(e.target.value)} /></p>
										<div>
											<div style={{cursor: 'pointer'}} onClick={() => setBetting()}>My Choice : {selectedAnswer}</div>
										</div>
									</fieldset>
								</form>
							</div>
						</dt>
						<dd>
							<ul>
								<li key='chat' className="qv-tab-chart active" onClick={() => tabOpen('chart')}><i className="uil uil-chart-line"></i> <span>Chat</span></li>
								<li key='vol' className="qv-tab-vol" onClick={() => tabOpen('vol')}><i className="uil uil-files-landscapes-alt"></i> <span>Vol</span></li>
								<li key='info' className="qv-tab-info" onClick={() => tabOpen('info')}><i className="uil uil-file-info-alt"></i> <span>Info</span></li>
							</ul>
							<div className="qv-chart">
								<h2>Voting Detail</h2>
								{/*<p><img src={chartTest} alt="" title="" /></p>*/}
								<p> 
									<textarea 
										id="votingDetail" 
										name="votingDetail"
										rows="100" 
										cols="500"
										style={{ height: "500px" }}
										defaultValue={quest?.questDetail}
										readOnly
									/>
								</p>
							</div>
							<div className="qv-vol">
								<h2>Total {addComma(questTotalAmount)} CT</h2>
								<ul>
									{
										answerHistory?.map((answerHist, index) => (
											<li key={index}>
												<div><i className="uil uil-circle"></i><span style={{color:`${answerHist.answerColor?.color?.value}`}}>{answerHist.answerTitle}</span></div>
												<div><span>{addComma(answerHist.bettingCoin)}</span> CT</div>
												<div>{Moment(answerHist.createdDateTime).format('YYYY-MM-DD')}</div>
											</li>
	  									))
									}
								</ul>
							</div>
							<div className="qv-info">
								<h2>Detail Information</h2>
								<ul>
									<li>
										<h2><i className="uil uil-angle-right"></i>Category</h2>
										<div>{quest?.categoryNm.seasonCategoryName}</div>
									</li>
									<li>
										<h2><i className="uil uil-angle-right"></i>Creator Fee</h2>
										<div>{quest?.creatorFee}</div>
									</li>
									<li>
										<h2><i className="uil uil-angle-right"></i>Volume</h2>
										<div>{addComma(quest?.totalAmount)}</div>
									</li>
									<li>
										<h2><i className="uil uil-angle-right"></i>Creator Salary</h2>
										<div>{addComma(quest?.creatorPay)}</div>
									</li>
									<li>
										<h2><i className="uil uil-angle-right"></i>Start Date</h2>
										<div>{Moment(quest?.startDateTime).format('YYYY-MM-DD')}</div>
									</li>
									<li>
										<h2><i className="uil uil-angle-right"></i>Transaction</h2>
										<div>{quest?.approveTx}</div>
									</li>
									<li>
										<h2><i className="uil uil-angle-right"></i>End Date</h2>
										<div>{Moment(quest?.endDateTime).format('YYYY-MM-DD')}</div>
									</li>
								</ul>
							</div>
						</dd>
					</dl>
				</div>
				{/* 상세 끝 */}
			</div>
    </div>
  );
}

function tabOpen(target) {
	document.querySelector('.qv-chart').style.display = 'none';
	document.querySelector('.qv-vol').style.display = 'none';
	document.querySelector('.qv-info').style.display = 'none';

	document.querySelector('.qv-tab-chart').classList.remove("active");
	document.querySelector('.qv-tab-vol').classList.remove("active");
	document.querySelector('.qv-tab-info').classList.remove("active");

	document.querySelector(`.qv-${target}`).style.display = 'block';
	document.querySelector(`.qv-tab-${target}`).classList.add("active");
}

function addComma(data) {
	if(!data) {
		return '';
	}

	return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default Index;