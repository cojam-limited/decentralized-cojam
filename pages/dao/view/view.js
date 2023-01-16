import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom'

import "react-datepicker/dist/react-datepicker.css";
import Moment from 'moment';
import { useLoadingState } from "@assets/context/LoadingContext";

import 'swiper/css';
import 'react-responsive-modal/styles.css';

import { urlFor, client } from "../../../sanity";
import { useWalletData } from '@data/wallet';

import { BalanceContext } from '../../../components/Context/BalanceContext';

import toastNotify from '@utils/toast';
import { QrContext } from '../../../components/Context/QrContext';

function Index(props) {
	const history = useHistory();

	// if(!props?.location?.state?.questId) {
	// 	toastNotify({
	// 		state: 'error',
	// 		message: 'wrong access.',
	// 	});

	// 	history.push('/');
	// }

		const { setLoading } = useLoadingState();
	const [ selectedAnswer, setSelectedAnswer ] = useState();
	const { walletData, mutateWalletData } = useWalletData();

	const [ questId ] = useState(props?.location?.state?.questId);
	const [ quest, setQuest ] = useState();
	const [ questTotalAmount, setQuestTotalAmount ] = useState();
	const [ answerTotalAmounts, setAnswerTotalAmounts ] = useState({});
	const [ answerPercents, setAnswerPercents ] = useState({});
	const [ answerAllocations, setAnswerAllocations ] = useState({});

	const [ answerHistory, setAnswerHistory ] = useState();

	// useEffect(() => {
	// 	let isLogin = false;
	// 	checkLogin(walletData).then((res) => {
	// 		isLogin = res;

	// 		if(!isLogin) {
	// 			toastNotify({
	// 				state: 'error',
	// 				message: 're login or check lock. please',
	// 			});
	// 			history.push('/');
	// 		}
	// 	});
	// }, []);

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
  const category = quest?.categoryNm?.seasonCategoryName;

  return (
		<div>
			<div className="dao-container">
				{/* 상세 */}
				<div className="dao-quest-view">
					<dl>
						<dt>
							<h2>
								<div>
									{category} <span>{quest?.totalAmount && addComma(quest?.totalAmount)}</span>
								</div>
								<div className='endtime'>
									{
										quest?.dDay === 'expired' ? (<div className='closed'>Closed</div>) :
										quest?.dDay === 'pending' ? (<div>PENDING</div>) :
										(<div>24:00:00</div>)
									}
								</div>
							</h2>
							{/* <h2><span>{quest?.dDay}</span> {quest?.endDateTime}</h2> */}
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
							<div className='endtime'>
								<p>End Vote<span>{quest?.endDateTime}</span></p>
							</div>
							<h3>{quest?.titleKR}</h3>
							<h4>Total Vote<span>{quest?.totalAmount}</span></h4>
							<ul>
							{
								quest?.answers && quest.answers.map((answer, index) => (
									<li key={index}>
										<div>{answer}</div>
										<p>{answerAllocations[answer] && answerAllocations[answer] !== '0%' ? `${answerAllocations[answer]} X` : '0%'} </p>
										<h2><div style={{width:`${answerPercents[answer] ?? 0}%`}}></div></h2>
									</li>
								))
							}
							</ul>
							<select
								style={{
									backgroundImage: 'url("../../../assets/caret-down-light.svg")'
								}}
								onChange={(e) => {setAnswerHistory(e.target.value)}}
							>
								<option value='All'>All</option>
								{
									quest?.answers && quest.answers.map((answer, index) => (
										<option value={answer} key={index}>{answer}</option>
									))
								}								
							</select>
							<ul className="votelist">
								{
									quest?.answerIds?.map((value, index) => (
										<li key={index}>
											<div>
												{value._id.slice(0,6) + '....' + value._id.slice(-4)}
											</div>
											<div>{value.title}</div>
											<div>{value.totalAmount}</div>
										</li>
									))
								}
								</ul>
						</dt>
					</dl>
				</div>
				{/* 상세 끝 */}
			</div>
    </div>
  );
}

function addComma(data) {
	if(!data) {
		return '';
	}

	return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default Index;