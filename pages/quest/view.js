import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'

import "react-datepicker/dist/react-datepicker.css";
import Moment from 'moment';
import { useLoadingState } from "@assets/context/LoadingContext";

import { VictoryChart, VictoryLine, VictoryLegend } from 'victory';

import 'swiper/css';
import 'react-responsive-modal/styles.css';

import doBetting from './doBetting';
import { urlFor, client } from "../../sanity";
import { useWalletData } from '@data/wallet';

import { getCojamBalance } from '@api/UseKaikas';

import backgroundImage from '@assets/body_quest.jpg';

function Index(props) {
	const [ onBetting, setOnBetting ] = useState();
	const { setLoading } = useLoadingState();
	const [ selectedAnswer, setSelectedAnswer ] = useState();
	const { walletData } = useWalletData();

	const [ questId ] = useState(props.location.state.questId);
	const [ quest, setQuest ] = useState();
	const [ questTotalAmount, setQuestTotalAmount ] = useState();
	const [ answerTotalAmounts, setAnswerTotalAmounts ] = useState({});
	const [ answerPercents, setAnswerPercents ] = useState({});
	const [ answerAllocations, setAnswerAllocations ] = useState({});

	const [ answerColors, setAnswerColors ] = useState({});
	const [ openQuestAdd, modalQuestAdd ] = useState(false);
	const [ openQuestSeason, modalQuestSeason ] = useState(false);

	const [ bettingCoin, setBettingCoin ] = useState(1);
	const [ rate, setRate ] = useState(0);
	const [ receiveToken, setReceiveToken ] = useState(0);
	const [ answerHistory, setAnswerHistory ] = useState();
	const [ historyGraph, setHistoryGraph ] = useState([]);	

	// modal values
  	const [ categories, setCategories ] = useState([]);
	const [ endDateTime, setEndDateTime ] = useState(new Date());
	const [ modalValues, setModalValues ] = useState({'_type': 'quests', 'questLanguage': 'EN', 'endDateTime': endDateTime});
	// modal values

	const setBetting = async () => {
		setLoading(true);
		if(!selectedAnswer) {
			alert('choice the answer !');
			setLoading(false);
			return;
		}

		try {
			const questAnswerId = quest.answerIds.filter((answerId) => answerId.title === selectedAnswer);
			const curBalance = await getCojamBalance(walletData.account);

			const betting = {
				'bettingCoin': Number(bettingCoin),
				'spenderAddress': '',
				'transactionId': '',
				'bettingStatus': '',
				'questKey': quest?.questKey,
				'questAnswerKey': questAnswerId[0], // TODO answer key
				'memberKey': '',
				'receiveAddress': '',
				'answerTitle': selectedAnswer,
				'curBalance': curBalance / 10 ** 18,
				'multiply': rate,
				'predictionFee': receiveToken
			}

			const betResult = await doBetting(betting, walletData);
			
			alert(`${betResult.message}`);
			setOnBetting('bet');
		} catch(error) {
			console.log('betting error', error);
			alert(`betting failed.`);
		}

		setLoading(false);
	}

	useEffect(() => {
		const questAnswerKeyArray = `["", ""]`;
		const questQuery = `*[_type == 'quests' && isActive == true && _id == '${questId}'] {..., 'now': now(), 'categoryNm': *[_type=='seasonCategories' && _id == ^.seasonCategory._ref]{seasonCategoryName}[0], 'answerIds': *[_type=='questAnswerList' && questKey == ^.questKey] {title, _id, questAnswerKey, totalAmount}} [0]`;
		
		let subscription;
		client.fetch(questQuery).then((quest) => {
			const answerList = quest.answerIds?.map((answerId, index) => {
				return `${answerId.questAnswerKey}`;
			});

			const query = `*[_type == 'questAnswerList' && (questAnswerKey in [${answerList}])]`;
			subscription = client.listen(query).subscribe((update) => {
				const answers = quest.answerIds;
				answers.forEach((answer) => {
					if(answer.title === update.result.title) {
						answer.totalAmount = update.result.totalAmount;
					}

					const resultPercent = answer.totalAmount / quest.totalAmount;
					const allocation = isNaN(Number(resultPercent).toFixed(2)) ? '0%' : Number(resultPercent  * 100).toFixed(2) +'% ('+ addComma(answer.totalAmount) +' CT)';
					answerTotalAmounts[answer.title] = answer.totalAmount;
					answerPercents[answer.title] = resultPercent * 100;
					answerAllocations[answer.title] = allocation;
		
					setAnswerTotalAmounts(answerTotalAmounts);
					setAnswerPercents(answerPercents);
					setAnswerAllocations(answerAllocations);
				});
			});
		});

		return () => subscription?.unsubscribe();
	}, []);

	useEffect(() => {
		setLoading(true);
		/**
		 * Quest 리스트 & 데이터 조회
		 */
		if(!questId) {
			alert('error. pick the quest again. please');
			setLoading(false);
			return;
		}

		const questQuery = `*[_type == 'quests' && isActive == true && _id == '${questId}'] {..., 'now': now(), 'categoryNm': *[_type=='seasonCategories' && _id == ^.seasonCategory._ref]{seasonCategoryName}[0], 'answerIds': *[_type=='questAnswerList' && questKey == ^.questKey] {title, _id, totalAmount}} [0]`;
		client.fetch(questQuery).then((quest) => {
			const diff = Moment(quest.now).diff(Moment(quest.endDateTime), 'days') 
			if(diff === 0) { 
				quest.dDay = 'D-0';
			} else {
				quest.dDay = diff > 0 ? 'expired' : `D${diff}`;
			}

			quest.startDateTime = Moment(quest.startDateTime).format('yyyy-MM-DD HH:mm:ss');
			quest.endDateTime = Moment(quest.endDateTime).format('yyyy-MM-DD HH:mm:ss');
			
			console.log('quest', quest);

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
			const answerHistoryQuery = `*[_type == 'betting' && questKey == ${quest.questKey} && createdDateTime > '${creteriaDate}'] {..., 'answerColor': *[_type=='questAnswerList' && questKey == ^.questKey && _id == ^.questAnswerKey]{color}[0] } | order(createdDateTime asc)`;
			client.fetch(answerHistoryQuery).then((answerHist) => {
				// group by date
				const graphGroupData = answerHist.reduce((group, answer) => {
					const { bettingCoin, createdDateTime, answerTitle, answerColor } = answer;

					answerColors[answerTitle] = answerColor.color?.value ?? 0;
					setAnswerColors(answerColors);

					const date = Moment(createdDateTime).format('YYYY-MM-DD');
					group[answerTitle] = group[answerTitle] || {};
					group[answerTitle][date] = group[answerTitle][date] ? Number(group[answerTitle][date]) + Number(bettingCoin) : Number(bettingCoin);
					return group;
				}, {});
				
				console.log('graphGroupData', graphGroupData);

				const graphKeys = [];
				const graphData = {};
				for (const [key, value] of Object.entries(graphGroupData)) {
					graphKeys.push(key);
					for(const [k, v] of Object.entries(graphGroupData[key])) {
						graphData[key] = graphData[key] || [];
						graphData[key].push({x: k, y: v});
					}
				}

				setHistoryGraph(graphData);
				setAnswerHistory(answerHist);
			});

			const seasonCategoryQuery = `*[_type == 'season' && isActive == true] {seasonCategories[] -> {seasonCategoryName, _id}}`;
			client.fetch(seasonCategoryQuery).then((datas) => {
				if(datas) {
					const localCategories = [{seasonCategoryName: 'All'}];
					datas[0].seasonCategories.forEach((category) => ( localCategories.push(category) ));
					setCategories(localCategories);
				}
			});

			setLoading(false);
		});  
		/**
		 * Quest 리스트 & 데이터 조회
		 */ 
	}, [onBetting]);

	useEffect(() => {
		if(!bettingCoin) {
			setBettingCoin(1);
		}

		const currentRate = Number(bettingCoin) / (Number(bettingCoin) + Number(answerTotalAmounts[selectedAnswer]));
		const returnToken = (questTotalAmount - answerTotalAmounts[selectedAnswer]) * currentRate;
		const getToken = Number(bettingCoin) + Number(returnToken);
		const calRate = Number(getToken) / Number(bettingCoin);

		const rateString = isNaN(Number(calRate).toFixed(1)) ? '-' : Number(calRate).toFixed(1);
		const tokenString = isNaN(Number(getToken)) ?  '-' : Number(getToken).toFixed(3);

		setRate(rateString);
		setReceiveToken(tokenString);
	}, [selectedAnswer, bettingCoin]);


  	return (
		<div className="bg-quest" style={{background: `url('${backgroundImage}') center -150px no-repeat`}}>

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
						quest?.snsUrl && 
						<div>
							<h2><span>Confirmed</span> BTS reached #1 on the Billboard Chart with a song "Dynamite". Will BTS be able to win "The album of the year" at the Grammy Awards held on January 31, 2021?</h2>
							<p><iframe title="movie" width="100%" height="650" src={quest.snsUrl} frameBorder="0" allow="accelerometer; autoPlay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe></p>
						</div>
					}
					<dl>
						<dt>
							<h2><span>{quest?.dDay}</span> {quest?.endDateTime}</h2>
							<p style={{ backgroundImage: `url('${quest && urlFor(quest.imageFile)}')`, backgroundPosition: `center`, backgroundSize: `cover` }}></p>
							
							<h3>Odds <span>{rate}</span> X</h3>
							<h3>Win <span>{receiveToken}</span> CT if right</h3>
							<ul>
								{
									quest?.answers && quest.answers.map((answer, index) => (
										<li key={index} onClick={() => setSelectedAnswer(answer)} style={{cursor:'pointer'}} className={`${selectedAnswer == answer && 'active'}`}>
											<div>{answer}</div>
											<p>{answerAllocations[answer]}X</p>
											<h2><div style={{width:`${answerPercents[answer]}%`}}></div></h2>
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
								<h2>Probability Chart</h2>
								{/*<p><img src={chartTest} alt="" title="" /></p>*/}
								<p> 
								<VictoryChart>
									{
										Object.keys(historyGraph).map((graphKey, index) => (
											<VictoryLine
												key={index}
												style={{
													data: { stroke: `${answerColors[graphKey]}` }
												}}
												data={historyGraph[graphKey]}
											/>
										))
									}
									<VictoryLegend x={125} y={0}
										centerTitle
										orientation="horizontal"
										gutter={20}
										style={{ border: { stroke: "black" }, title: {fontSize: 20 } }}
										data={
											Object.keys(answerColors).map((colorKey) => (
												{ name: `${colorKey}`, symbol: { fill: `${answerColors[colorKey]}` } }
											))
										}
									/>
								</VictoryChart>
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


				{/* 등록버튼 */}
				<div className="add-btn">
					<Link to="#" onClick={() => modalQuestAdd(true)}><i className="uil uil-plus"></i></Link>
				</div>
				{/* 등록버튼 끝 */}
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
	if(!data) return '';

	return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default Index;