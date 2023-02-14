import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'

import "react-datepicker/dist/react-datepicker.css";
import Moment from 'moment';
import { useLoadingState } from "@assets/context/LoadingContext";

import 'swiper/css';
import 'react-responsive-modal/styles.css';

import { urlFor, client } from "../../../sanity";

import toastNotify from '@utils/toast';
import { Icon } from '@iconify/react';

function Index(props) {
	const history = useHistory();

	if(!props?.location?.state?.questId) {
		toastNotify({
			state: 'error',
			message: 'wrong access.',
		});

		history.push('/Dao');
	}

	const { setLoading } = useLoadingState();
	const [ selectedAnswer, setSelectedAnswer ] = useState();
	const [ questId ] = useState(props?.location?.state?.questId);
	const [ item, setItem ] = useState();
	const [ voteList, setVoteList ] = useState();
	const [ answerHistory, setAnswerHistory ] = useState('All');
	const [ nowTime, setNowTime ] = useState(new Date());
	useEffect(async () => {
    setInterval(() => {
      setNowTime(new Date())
    }, 1000)
  }, [])

	const answerList = [
    {title: 'Approve', level: 'draft'},
    {title: 'Reject', level: 'draft'},
    {title: 'Success', level: 'success'},
    {title: 'Adjourn', level: 'success'},
		{title: 'Done', level: 'done'},
		{title: 'Done', level: 'done'},
  ];

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

		const governanceItemQuery = `*[_type == 'governanceItem' && references('${questId}') && _id != '${Date.now()}']
    {
      ...,
      'quest': *[_type == 'quests' && _id == ^.questKey._ref && _id != '${Date.now()}'][0]{
        ...,
        'answerId': *[_type == 'questAnswerList' && questKey == ^.questKey && _id != '${Date.now()}'] {title, _id, totalVotes, questAnswerKey}
      },
    }`;
		client.fetch(governanceItemQuery).then((item) => {
			setItem(item[0]);
		})

		const answerListQuery = `*[_type == 'governanceItemVote' && governanceItemId == '${questId}' && _id != '${Date.now()}']`
		client.fetch(answerListQuery).then((answer) => {
			setVoteList(answer);
			setLoading(false);
		})
	}, []);

	const level = item?.level === 'draft' ? 'Draft' : item?.level === 'success' ? 'Success' : item?.level === 'answer' ? 'Answer' : item?.level;
	const endVoteTime = item?.level === 'draft' ? item?.draftEndTime : item?.level === 'success' ? item?.successEndTime : item?.level === 'answer' ? item?.answerEndTime : Moment().format("yyyy-MM-DD HH:mm:ss");

	const endTime = item?.level === 'draft' ? new Date(item?.draftEndTime) : item?.level === 'success' ? new Date(item?.successEndTime) : new Date(item?.answerEndTime);

	const diff = endTime - nowTime

	const diffHour = Math.floor((diff / (1000*60*60)) % 24);
	const diffMin = Math.floor((diff / (1000*60)) % 60);
	const diffSec = Math.floor(diff / 1000 % 60);

	let agreeVote
	let disagreeVote
	if(level === 'Draft') {
		agreeVote = !isFinite(Number(item?.approveTotalVote)) ? 0 : Number(item?.approveTotalVote);
		disagreeVote = !isFinite(Number(item?.rejectTotalVote)) ? 0 : Number(item?.rejectTotalVote);
	} else if(level === 'Success') {
		agreeVote = !isFinite(Number(item?.successTotalVote)) ? 0 : Number(item?.successTotalVote);
		disagreeVote = !isFinite(Number(item?.adjournTotalVote)) ? 0 : Number(item?.adjournTotalVote);
	}
	const totalAmount = level === 'Draft' || level === 'Success' ? agreeVote + disagreeVote : level === 'Answer' ? item?.answerTotalVote : 0;
	const agreePer = !isFinite(agreeVote / totalAmount) ? '0' : ((agreeVote / totalAmount) * 100).toFixed(2);
	const disagreePer = !isFinite(disagreeVote / totalAmount) ? '0' : ((disagreeVote / totalAmount) * 100).toFixed(2);

	const goBackHandler = () => {
    history.goBack();
  }

  return (
		<div>
			<div className="dao-container" style={{paddingBottom: '0'}}>
				{/* 상세 */}
				<div className="dao-quest-view">
					<dl>
						<dt>
							<h2>
								<div>
									<Icon
										icon="material-symbols:keyboard-arrow-left"
										className='arrow'
										style={{cursor: 'pointer', fontSize: '30px'}}
										onClick={goBackHandler}
									/>
									{level} <span>{totalAmount && addComma(totalAmount)}</span>
								</div>
								<div className='endtime'>
									{
										(totalAmount < 5000 && diff > 0) ? (<div>{diffHour > 9 ? diffHour : '0' + diffHour}:{diffMin > 9 ? diffMin : '0' + diffMin}:{diffSec > 9 ? diffSec : '0' + diffSec}</div>) : (<div className='closed'>Closed</div>)
									}
								</div>
							</h2>
							<p 
								onClick={() => {
									if(item?.quest?.imageLink && item?.quest?.imageLink !== '') {
										const toUrl = item?.quest?.imageLink.indexOf('http') === -1 
													? `https://${item?.imageLink}` 
													: `${item?.quest?.imageLink}`;

										window.open(toUrl, '_blank').focus();
									} 
								}} 

								style={{ 
									cursor: item?.quest?.imageLink ? 'pointer' : '', 
									backgroundImage: `url('${item?.quest && (item?.quest.imageFile && item?.quest.imageFile.asset ? urlFor(item?.quest.imageFile) : item?.quest.imageUrl)}')`, 
									backgroundPosition: `center`, 
									backgroundSize: `cover` 
								}}
							/>
							<div className='endtime'>
								<p>End Vote<span>{endVoteTime}</span></p>
							</div>
							<h3>{item?.quest?.titleKR}</h3>
							<h4>Total Vote<span>{totalAmount}</span></h4>
							<ul className={item?.level === 'answer' ? 'answer-list' : ''}>
								{
									item?.level === 'answer' ? 
									(
										item?.quest?.answerId.sort(function(a, b) {
											return a.questAnswerKey - b.questAnswerKey
										}).map((answer, index) => {
											const totalVote = item.answerTotalVote;
											const percent = !isFinite(answer.totalVotes / totalVote) ? '0' : ((answer.totalVotes / totalVote) * 100).toFixed(2);
											return (
												<li key={index} onClick={() => setSelectedAnswer(answer)} style={{cursor:'pointer'}} className={`${selectedAnswer == answer && 'active'}`}>
													<div>{answer.title}</div>
													<p>
														{answer.totalVotes ?? 0}({percent}%)
													</p>
													<h2>
														<div style={{ width: `${percent ?? 0}%`}}></div>
													</h2>
												</li>
											)
										})
									)
									:
									(
										answerList?.map((answer, index) => {
											if(item?.level === answer?.level) {
												return (
													<li key={index}>
														<div>{answer?.title}</div>
														<p>
															{answer?.title === 'Approve' || answer?.title === 'Success' ? agreeVote : disagreeVote}({answer?.title === 'Approve' || answer?.title === 'Success' ? agreePer : disagreePer}%)
														</p>
														<h2>
															<div style={{ width: `${answer?.title === 'Approve' || answer?.title === 'Success' ? agreePer : disagreePer ?? 0}%` }}></div>
														</h2>
													</li>
												)
											}
										})
									)
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
									item?.level === 'draft' || item?.level === 'success' ? (
										answerList?.map((answer, index) => {
											if(item?.level === answer.level) {
												return (
													<option value={answer.title} key={index}>{answer.title}</option>
												)
											}
										})
									) : (
										item?.quest?.answerId.map((answer, index) => {
											return (
												<option value={answer.title} key={index}>{answer.title}</option>
											)
										})
									)
								}
							</select>
							<ul className="votelist">
								{
									voteList?.map((list, index) => {
										const DraftOption = list?.draftOption === 'approve' ? 'Approve' : list?.draftOption === 'reject' ? 'Reject' : '';
										const SuccessOption = list?.successOption === 'success' ? 'Success' : list?.successOption === 'adjourn' ? 'Adjourn' : '';
										const voteAnswer = item?.level === 'draft' ? DraftOption : item?.level === 'success' ? SuccessOption : item?.level === 'answer' ? list?.answerOption : '';
										const voteCount = item?.level === 'draft' ? list?.draftCount : item?.level === 'success' ? list?.successCount : item?.level === 'answer' ? list?.answerCount : 0;
										
										if(answerHistory === 'All') {
											if(item?.level === 'draft' && !list?.successOption && list?.draftOption) {
												return (
													<li key={index}>
														<div>
															{list.voter.toUpperCase().slice(0,6) + '....' + list.voter.toUpperCase().slice(-4)}
														</div>
														<div>{voteAnswer}</div>
														<div>{voteCount}</div>
													</li>
												)
											} else if(item?.level === 'success' && list?.successOption && !list?.answerOption) {
												return (
													<li key={index}>
														<div>
															{list.voter.toUpperCase().slice(0,6) + '....' + list.voter.toUpperCase().slice(-4)}
														</div>
														<div>{voteAnswer}</div>
														<div>{voteCount}</div>
													</li>
												)
											} else if(item?.level === 'answer' && list?.answerOption) {
												return (
													<li key={index}>
														<div>
															{list.voter.toUpperCase().slice(0,6) + '....' + list.voter.toUpperCase().slice(-4)}
														</div>
														<div>{voteAnswer}</div>
														<div>{voteCount}</div>
													</li>
												)
											}
										} else if(answerHistory === voteAnswer){
											return (
												<li key={index}>
													<div>
														{list.voter.toUpperCase().slice(0,6) + '....' + list.voter.toUpperCase().slice(-4)}
													</div>
													<div>{voteAnswer}</div>
													<div>{voteCount}</div>
												</li>
											)
										}
									})
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