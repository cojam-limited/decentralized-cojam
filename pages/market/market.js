//import { Link } from 'react-router-dom'
import React, { useState, useEffect, useContext } from 'react';
import { Modal } from 'react-responsive-modal';

import { useHistory } from 'react-router-dom'
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import { client, urlFor } from "../../sanity";
import 'react-responsive-modal/styles.css';
import backgroundImage from '@assets/body_mypage.jpg';
import { useWalletData } from '@data/wallet';
import { useLoadingState } from "@assets/context/LoadingContext";
import { changeStateFunction } from './statusFunctions';
import { QrContext } from '../../components/Context/QrContext';

import { callTransferOwnership } from '@api/UseTransactions';
import { checkLogin } from "@api/UseTransactions";

import Moment from 'moment';
import toastNotify from '@utils/toast';

function Index() {
	const history = useHistory();
	const { setQr, setQrModal, setMinutes, setSeconds } = useContext(QrContext);
	const [ openDetail, modalDetail ] = useState(false);
	const { setLoading } = useLoadingState();
	const { walletData } = useWalletData();
	const [ transactionDatas, setTransactionDatas ] = useState([]);
	const [ admins, setAdmins ] = useState([]);
	const [ activeAdmin, setActiveAdmin ] = useState();
	const [ selectedAdmin, setSelectedAdmin ] = useState({});
	const [ popups, setPopups ] = useState([]);
	
	const [ categories, setCategories ] = useState([]);
	const [ activeCategory, setActiveCategory ] = useState('ONGOING');
	const [ activeDetailData, setActiveDetailData ] = useState({});
	const [ selectedQuest, setSelectedQuest ] = useState([]);

	const [ openSuccess, modalSuccess ] = useState(false);
	const [ selectedAnswer, setSelectedAnswer ] = useState('');
	const [ rewardInfo, setRewardInfo ] = useState({});

	const [ openAdjourn, modalAdjourn ] = useState(false);
	const [ adjournDesc, setAdjournDesc ] = useState('');

	const [ openInvalid, modalInvalid ] = useState(false);
	const [ invalidDesc, setInvalidDesc ] = useState('');

	const [ reloadData, setReloadData ] = useState(false);

	const stateButtons = {
		ONGOING: ['pend', 'unpend', 'invalid', 'draft', 'answer', 'approve'],
		INVALID: [],
		APPROVE: ['hot', 'pend', 'unpend', 'finish', 'adjourn', 'success'],
		ADJOURN: ['retrieve'],
		SUCCESS: ['retrieve'],
		ADMIN: ['grant admin'],
	}

	const clickStateButton = async (state) => {
		if(selectedQuest.length === 0) {
			toastNotify({
				state: 'error',
				message: 'choose the quest to change the state',
			});
			return;
		}

		// modal 통해서 진행해야하는 status
		if(state === 'success') {
			loadDetailData(selectedQuest.questKey, false);
			modalSuccess(true);
			return;
		} else if(state === 'adjourn') {
			modalAdjourn(true);
			return;
		} else if(state === 'invalid') {
			modalInvalid(true);
			return;
		}

		const walletAddress = walletData?.account;
		if(activeAdmin?.walletAddress.toLowerCase() !== walletAddress?.toLowerCase()) {
			toastNotify({
				state: 'error',
				message: 'you need a contract ownership',
			});
			return;
		}

		setLoading(true);
		await changeStateFunction({state, walletData, selectedQuest, setQr, setQrModal, setMinutes, setSeconds});
		setReloadData(!reloadData);
		setLoading(false);
	}

	const transferAdmin = async (member) => {
		const walletAddress = member.walletAddress;

		if(window.confirm(`[${walletAddress}] transfer to admin ?`)) {
			let isLogin = false;
			await checkLogin(walletData).then((res) => {
				isLogin = res;
			});

			if(!isLogin) {
				toastNotify({
					state: 'error',
					message: 're login or check lock. please',
				});
				return;
			}

			//const result = await callTransferOwnership(walletAddress, setQr, setQrModal, setMinutes, setSeconds);
			const result = await callTransferOwnership(walletData, setQr, setQrModal, setMinutes, setSeconds);

			if(result.status === 200) {
				await client.patch(activeAdmin._id)
							.set({ 
								active: false
							})
							.commit();

				await client.patch(member._id)
							.set({ 
								active: true
							})
							.commit();

				setActiveAdmin(member);	

				toastNotify({
					state: 'success',
					message: 'transfer to admin success',
				});
			} else {
				toastNotify({
					state: 'error',
					message: 'transfer to admin failed',
				});
			}
		}
	}
	
	/**
	 * title 클릭 시, Quest 디테일 조회
 	*/
	const loadDetailData = (questKey, openDetailModal) => {
		 setLoading(true);
		 const questQuery = `*[_type == 'quests' && questKey == ${questKey} && _id != '${Date.now()}'][0] {...,  'answerKeys': *[_type=='questAnswerList' && questKey == ^.questKey && ^._id != '${Date.now()}'] { title, totalAmount, questKey, questAnswerKey, _id } | order(questAnswerKey asc)}`;
		 client.fetch(questQuery).then((quest) => {
			 const seasonQuery = `*[_type == 'season' && _id == '${quest.season?._ref}'][0]`
			 client.fetch(seasonQuery).then((season) => {
				const detailDatas = {
					questKey: quest.questKey,
					imageFile: quest.imageFile,
					imageLink: quest.imageLink,
					imageUrl: quest.imageUrl,
					titleEN: quest.titleEN,
					titleKR: quest.titleKR,
					titleCH: quest.titleCH,
					categoryName: quest.categoryName,
					status: quest.questStatus,
					description: quest.description,
					draftTx: quest.draftTx,
					answerTx: quest.answerTx,
					approveTx: quest.approveTx,
					adjournTx: quest.adjournTx,
					successTx: quest.successTx,
					finishTx: quest.finishTx,
					successDateTime: quest.successDateTime,
					answers: quest.answerKeys,
					totalAmount: Number(quest.totalAmount),
					creatorAddress: quest.creatorAddress,
					selectedAnswer: quest.selectedAnswer,

					seasonTitle: season.title,
					seasonDesc : season.description,
					cojamFee: season.cojamFee,
					charityFee: season.charityFee,
					creatorFee: season.creatorFee,
					creatorPay: season.creatorPay,
					minimumPay: season.minimumPay,
					maximumPay: season.maximumPay,
					openDetailModal: openDetailModal
				}

				setActiveDetailData(detailDatas);
			 });
		 });
	}

	// loading 종료
	useEffect(() => {
		if(activeDetailData['openDetailModal'] && activeDetailData.questKey) {
			modalDetail(true);
		}

		setRewardInfo({});

		const rewardInfoQuery = `*[_type == 'betting' && questKey == ${activeDetailData.questKey} && _id != '${Date.now()}']`;
		client.fetch(rewardInfoQuery).then(async (rewardBettings) => {
			
			const questInfoQuery = `*[_type == 'quests' && questKey == ${activeDetailData.questKey} && _id != '${Date.now()}'][0]`;
			await client.fetch(questInfoQuery).then((quest) => {
				const memberRewards = addGroupBy(rewardBettings, 'memberKey');
				const titleRewards = addGroupBy(rewardBettings, 'answerTitle');

				// set member reward. each member's wallet address
				const memberRewardArr = [];
				for(const [memberAddress, rewardObj] of Object.entries(memberRewards)) {
					const cojam_ct = quest?.totalAmount * quest?.cojamFee / 100;
					const creator_ct = quest?.totalAmount * quest?.creatorFee / 100 + quest?.creatorPay;
					const charity_ct = quest?.totalAmount * quest?.charityFee / 100;
					const real_total_ct = quest?.totalAmount - cojam_ct - creator_ct - charity_ct;
					const magnification = real_total_ct / rewardObj.bettingCoin * 100;

					const predictionFee = (magnification * rewardObj.bettingCoin) / 100;
					memberRewardArr.push({ title: rewardObj.title, walletAddress: memberAddress, predictionFee: predictionFee, multiply: magnification });
				}

				// group by member key
				const curRewardInfo = {
					minimumPay: quest?.minimumPay ?? 0,
					maximumPay: quest?.maximumPay ?? 0,
					charityFee: quest?.charityFee ?? 0,
					cojamFee: quest?.cojamFee ?? 0,
					creatorFee: quest?.creatorFee ?? 0,
					creatorPay: quest?.creatorPay ?? 0,
					
					memberRewards: memberRewardArr,
					titleRewards: titleRewards
				}

				setRewardInfo(curRewardInfo);
			});

			setLoading(false);
		});

		setLoading(false);
	}, [activeDetailData]);
	/**
	 *title 클릭 시, Quest 디테일 조회
	 */

	useEffect(() => {
		const categoryQuery = `*[_type == 'marketCategories'] | order(order asc)`;
		client.fetch(categoryQuery).then((categories) => {
			setCategories(categories);
		});
	}, []);

	const addGroupBy = function (data, key) {
		return data.reduce(function (carry, el) {
			var group = el[key];
	
			if (carry[group] === undefined) {
				carry[group] = { title: el['answerTitle'], bettingCoin: 0 };
			}
			
			carry[group]['bettingCoin'] += el.bettingCoin ?? 0;
			return carry
		}, {})
	}
	
	useEffect(() => {
		setLoading(true);

		const walletAddress = walletData.account;
		if(walletAddress === '') {
			toastNotify({
				state: 'error',
				message: 'logout',
			});
			history.push('/');
		}
		
		if(walletAddress) {
			const condition = `${activeCategory === '' ? '' : `&& questStatus == '${activeCategory.toLowerCase()}'`}`;
			const questQuery = `*[_type == 'quests' && _id != '${Date.now()}' ${condition}] { ..., 'categoryNm': *[_type=='seasonCategories' && _id == ^.seasonCategory._ref]{seasonCategoryName}[0]} | order(questKey desc)`;
			client.fetch(questQuery).then((quest) => {
				setTransactionDatas(quest ?? []);
				setLoading(false);
			});	

			// get admin list & check current account is admin
			const adminQuery = `*[_type == 'admin' && _id != '${Date.now()}']`;
			client.fetch(adminQuery).then((admins) => {
				if(admins) {
					let isAdmin = false;
					admins.forEach((admin) => {
						if(admin.walletAddress?.toLowerCase() === walletAddress?.toLowerCase()) {
							isAdmin = true;
						}
					});

					admins.sort(function compare(a, b) {
						return a.active ? -1 : 1;
					});

					if(!isAdmin) {
						toastNotify({
							state: 'error',
							message: 'this account is not admin.',
						});
						history.push('/');
					}

					setActiveAdmin(admins[0]);
					setAdmins(admins);
				}
			});
			
			const popupQuery = `*[_type == 'popup']`;
			client.fetch(popupQuery).then((popups) => {
				setPopups(popups);
			});
		}

		setSelectedQuest([]);
	}, [walletData, reloadData, activeCategory]);

	return (
		<div className="bg-mypage" style={{background: `url('${backgroundImage}') center -590px no-repeat, #eef0f8 `}}>

				{/* 타이틀영역 */}
				<div className="title-area">
					ADMIN
				</div>
				{/* 타이틀영역 끝 */}

				{/* 마이페이지 - 탭버튼 */}
				<ul className="markets-tab">
					<li className="mt-tab01 active" onClick={() => { setActiveCategory('ONGOING'); tabOpen01();  } }><i className="uil uil-chart-line"></i> <span>Cojam Ground</span></li>
					<li className="mt-tab02" onClick={() => { setActiveCategory('ADMIN'); tabOpen02(); }}><i className="uil uil-files-landscapes-alt"></i> <span>Grant Admin</span></li>
					<li className="mt-tab03" onClick={tabOpen03}><i className="uil uil-file-info-alt"></i> <span>Pop-up</span></li>
				</ul>
				{/* 마이페이지 - 탭버튼 끝 */}

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
							categories?.map((category, index) => (
								<SwiperSlide key={index} className={"swiper-slide " + (category.categoryName === activeCategory ? 'active' : '')} onClick={() => setActiveCategory(category.categoryName)} style={{cursor:'pointer'}}>{category.categoryName}</SwiperSlide>
							))
						}
						</Swiper>
						</dt>
						<dd>
						</dd>
					</dl>
				</div>
				{/* 카테고리 영역 끝 */}

				{/* 마켓 - 상태변경 버튼 시작 */}
				<div className="mypage-info">
					<dd>
					{
						stateButtons[activeCategory]?.map((stateButton, index) => (
							<a href="#" key={index} onClick={() => clickStateButton(stateButton)} className="btn-blue">{stateButton}</a>
						))
					}
					</dd>
				</div>
				{/* 마켓 - 상태변경 버튼 끝 */}

				{/* 마켓 - 내용 */}
				<div className="market-content">
					<div className="mc-markets" style={{ display: 'block' }}>
						<div>
							<ul>
								<li key='1'><strong> </strong></li>
								<li key='2'><strong>No.</strong></li>
								<li key='3'><strong>Category</strong></li>
								<li key='4'><strong>Title</strong></li>
								<li key='5'><strong>End Date</strong></li>
								<li key='6'><strong>Total(minimum)</strong></li>
								<li key='7'><strong>Pend </strong></li>
								<li key='8'><strong>Hot </strong></li>
								<li key='9'><strong>Draft </strong></li>
								<li key='10'><strong>Answer </strong></li>
								<li key='11'><strong>Finish </strong></li>
							</ul>

							{
								transactionDatas?.map((transactionData, index) => (
									<ul key={index} style={{ background: transactionData._id === selectedQuest._id ? '#2132' : '' }} >
										<li key='1'><input type="checkbox" onChange={() => { setSelectedQuest(transactionData) }} checked={transactionData._id === selectedQuest._id}/></li>
										<li key='2'><span>No. : </span> {index + 1} </li>
										<li key='3'><span>Category : </span> {transactionData.categoryNm?.seasonCategoryName} </li>
										<li key='4' onClick={() => { loadDetailData(transactionData.questKey, true); }} style={{ cursor: 'pointer' }}>
											<span>Title : </span> 
											{
												transactionData.questLanguage === 'EN'  ? transactionData.titleEN
																					    : transactionData.questLanguage === 'KR' 
																							 ? transactionData.titleKR
																							 : transactionData.titleCH
											} 
										</li>
										<li key='5'><span>End Date : </span> {Moment(transactionData.endDateTime).format('YYYY-MM-DD HH:mm:ss')} </li>
										<li key='6'><span>Total(minimum) : </span> {transactionData.totalAmount} ({transactionData.minimumPay})</li>
										<li key='7'><span>Pend : </span> { transactionData.pending ? 'T' : 'F' } </li>
										<li key='8'><span>Hot : </span> { transactionData.hot ? 'T' : 'F' } </li>
										<li key='9'><span>Draft : </span> { transactionData.draftTx !== undefined ? 'T' : 'F' } </li>
										<li key='10'><span>Answer : </span> { transactionData.answerTx !== undefined ? 'T' : 'F' } </li>
										<li key='11'><span>Finish : </span> { transactionData.finishTx !== undefined ? 'T' : 'F' } </li>
									</ul>
								))
							}
						</div>
					</div>
				</div>
				{/* 마켓 - 내용 끝 */}

				{/* 모달 - 상세 */}
				<Modal open={openDetail} onClose={() => modalDetail(false)} center>
					<div className="modal-mypage-view">
						<form name="addForm" method="post" action="">
							<fieldset>
								<legend>Ground Detail</legend>
								<div className="mmv-area">
									<dl>
										<dt>Ground Detail</dt>
										<dd><i className="uil uil-times" onClick={() => modalDetail(false)}></i></dd>
									</dl>
									<ul>
										{
											activeDetailData &&
											<>
												<li
													style={{ 
														width: '100%',
														height: '450px'
													}}
												>
													<p 
														onClick={() => {
															if(activeDetailData?.imageLink && activeDetailData?.imageLink !== '') { 
																const toUrl = activeDetailData?.imageLink.indexOf('http') === -1 
																			? `https://${activeDetailData?.imageLink}` 
																			: `${activeDetailData?.imageLink}`;

																window.open(toUrl, '_blank').focus();
															}
														}} 
														style={{
															width: '100%',
															height: '100%',
															cursor: activeDetailData?.imageLink ? 'pointer' : '',
															backgroundImage: `url('${activeDetailData && (activeDetailData.imageFile ? urlFor(activeDetailData.imageFile) : activeDetailData.imageUrl)}')`, 
															backgroundPosition: `center`, 
															backgroundSize: `cover` 
														}}
													/>
												</li>
												
												<li>
													<span>Title(English)</span>
													<input name="name" type="text" className="w100p" placeholder="" readOnly defaultValue={activeDetailData.titleEN}/>
												</li>
												<li>
													<span>Title(Korean)</span>
													<input name="name" type="text" className="w100p" placeholder="" readOnly defaultValue={activeDetailData.titleKR}/>
												</li>
												<li>
													<span>Title(Chinese)</span>
													<input name="name" type="text" className="w100p" placeholder="" readOnly defaultValue={activeDetailData.titleCH}/>
												</li>
												<li>
													<span>Category</span>
													<input name="name" type="text" className="w100p" placeholder="" readOnly defaultValue={activeDetailData.categoryName}/>
												</li>
												<li>
													<span>Status</span>
													<input name="name" type="text" className="w100p" placeholder="" readOnly defaultValue={activeDetailData.status}/>
												</li>
												<li>
													<span>Description</span>
													<input name="name" type="text" className="w100p" placeholder="" readOnly defaultValue={activeDetailData.description}/>
												</li>
												<li>
													<span>Draft Transaction</span>
													<input name="name" type="text" className="w100p" placeholder="" readOnly defaultValue={activeDetailData.draftTx}/>
												</li>
												<li>
													<span>Answers Transaction</span>
													<input name="name" type="text" className="w100p" placeholder="" readOnly defaultValue={activeDetailData.answerTx}/>
												</li>
												<li>
													<span>Apporve Transaction</span>
													<input name="name" type="text" className="w100p" placeholder="" readOnly defaultValue={activeDetailData.approveTx}/>
												</li>
												<li>
													<span>Adjourn Transaction</span>
													<input name="name" type="text" className="w100p" placeholder="" readOnly defaultValue={activeDetailData.adjournTx}/>
												</li>
												<li>
													<span>Success Transaction</span>
													<input name="name" type="text" className="w100p" placeholder="" readOnly defaultValue={activeDetailData.successTx}/>
												</li>
												<li>
													<span>Answer List</span>
													{
														activeDetailData?.answers?.map((answer, index) => (
															<input 
																key={index} name="name" 
																type="text" 
																className="w100p" 
																placeholder="" 
																readOnly 
																defaultValue={`${answer.title} (${addComma(answer.totalAmount)} CT)`}
																style={{ color: activeDetailData.selectedAnswer === answer.title ? '#fff' : 'black', background: activeDetailData.selectedAnswer === answer.title ? '#8950fc' : '' }}
															/>
														))
													}
													
												</li>
												<li>
													<div className="mqs-info">
														<h2>Title : {activeDetailData.seasonTitle}</h2>
														<h2>Description : {activeDetailData.seasonDesc}</h2>
														<div>
															COJAM Fee : <span>{activeDetailData.cojamFee}%</span>
															<br />
															Charity Fee : <span>{activeDetailData.charityFee}%</span>
															<br />
															Creator Fee : <span>{activeDetailData.creatorFee}%</span>
															<br />
															Creator Pay : <span>{activeDetailData.creatorPay} CT</span>
															<br />
															Minimum Pay : <span>{activeDetailData.minimumPay} CT</span>
															<br />
															Maximum Pay : <span>{activeDetailData.maximumPay} CT</span>
														</div>
													</div>
												</li>
											</>
										}
									</ul>
									<p>
										<a href="#" onClick={() => modalDetail(false)}>Confirm</a>
									</p>
								</div>
							</fieldset>
						</form>
					</div>
				</Modal>
				{/* 모달 - 상세 끝 */}

				{/* 모달 - SUCCESS 시작 */}
				<Modal open={openSuccess} onClose={() => modalSuccess(false)} center>
					<div className="modal-mypage-view">
						<form name="addForm" method="post" action="">
							<fieldset>
								<legend>Success Detail</legend>
								<div className="mmv-area">
									<dl>
										<dt>Success Detail</dt>
										<dd><i className="uil uil-times" style={{ cursor: 'pointer' }} onClick={() => modalSuccess(false)}></i></dd>
									</dl>
									<ul>
										{
											activeDetailData &&
											<>
												<li>
													<span>Answer List</span>
													{
														activeDetailData?.answers?.map((answer, index) => (
															<input 
																key={index} 
																name="name" 
																type="text" 
																className="w100p" 
																placeholder="" 
																style={{ color: 'black', cursor: 'pointer', background: answer.title === selectedAnswer?.title ? '#8950fc' : '' }} 
																onClick={() => {setSelectedAnswer(answer)}} 
																readOnly 
																defaultValue={answer.title}
															/>
														))
													}
												</li>
											</>
										}
									</ul>
									<ul>
									{
										selectedAnswer &&
										(
											<>
												<li key={10}>minimumPay : {rewardInfo?.minimumPay}</li>
												<li key={20}>maximumPay : {rewardInfo?.maximumPay}</li>
												<li key={30}>charityFee : {rewardInfo?.charityFee}</li>
												<li key={40}>cojamFee : {rewardInfo?.cojamFee}</li>
												<li key={50}>creatorFee : {rewardInfo?.creatorFee}</li>
												<li key={60}>creatorPay : {rewardInfo?.creatorPay}</li>
												<li key={70}></li>
												<li key={80}> * Reward Address</li>
												<li key={90}> address / multiply / predictionFee </li>
											{
												rewardInfo?.memberRewards?.filter((reward) => selectedAnswer.title === reward.title).map((memberReward, index) => (	
													<li key={index}> {memberReward.walletAddress} / {memberReward.multiply ? (memberReward.multiply / 100).toFixed(2) : 0} / {memberReward.predictionFee || 0} CT </li>
												))
											}
											</>
										)
									}
									</ul>
									<p>
										<a href="#" onClick={
											async () => { 
												if(selectedAnswer?.title === undefined) {
													toastNotify({
														state: 'error',
														message: 'select answer. please',
													});
													return;
												}
												
												const walletAddress = walletData.account;
												if(activeAdmin.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
													toastNotify({
														state: 'error',
														message: 'you need a contract ownership',
													});
													return;
												}

												setLoading(true);
												await changeStateFunction({state: 'success', walletData, selectedQuest, selectedAnswer, setQr, setQrModal, setMinutes, setSeconds});
												setLoading(false);

												modalSuccess(false);
											}
										}>
											Confirm
										</a>
									</p>
								</div>
							</fieldset>
						</form>
					</div>
				</Modal>
				{/* 모달 - SUCCESS 끝 */}

				{/* 모달 - ADJOURN Description 시작 */}
				<Modal open={openAdjourn} onClose={() => modalAdjourn(false)} center>
					<div className="modal-mypage-view">
						<form name="addForm" method="post" action="">
							<fieldset>
								<legend>Adjourn Description</legend>
								<div className="mmv-area">
									<dl>
										<dt>Adjourn Description</dt>
										<dd><i className="uil uil-times" style={{ cursor: 'pointer' }} onClick={() => modalAdjourn(false)}></i></dd>
									</dl>
									<div>
										<input type="text" onChange={(e) => { setAdjournDesc(e.target.value) }} style={{ width: '50%', margin: '10px 0px' }} />
									</div>
									<p>
										<a href="#" onClick={
											async () => { 
												if(adjournDesc === '') {
													toastNotify({
														state: 'error',
														message: 'put on adjorun description. please',
													});
													return;
												}

												const walletAddress = walletData.account;
												if(activeAdmin.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
													toastNotify({
														state: 'error',
														message: 'you need a contract ownership',
													});
													return;
												}

												setLoading(true);
												await changeStateFunction({state: 'adjourn', walletData, selectedQuest, selectedAnswer, description: adjournDesc, setQr, setQrModal, setMinutes, setSeconds});
												setLoading(false);

												modalAdjourn(false);
											}
										}>
											Confirm
										</a>
									</p>
								</div>
							</fieldset>
						</form>
					</div>
				</Modal>
				{/* 모달 - ADJOURN Description 끝 */}

				{/* 모달 - INVALID Description 시작 */}
				<Modal open={openInvalid} onClose={() => modalInvalid(false)} center>
					<div className="modal-mypage-view">
						<form name="addForm" method="post" action="">
							<fieldset>
								<legend>Invalid Description</legend>
								<div className="mmv-area">
									<dl>
										<dt>Invalid Description</dt>
										<dd><i className="uil uil-times" style={{ cursor: 'pointer' }} onClick={() => modalInvalid(false)}></i></dd>
									</dl>
									<div>
										<input type="text" onChange={(e) => { setInvalidDesc(e.target.value) }} style={{ width: '50%', margin: '10px 0px' }} />
									</div>
									<p>
										<a href="#" onClick={
											async () => { 
												if(invalidDesc === '') {
													toastNotify({
														state: 'error',
														message: 'put on invalid description. please',
													});
													return;
												}

												const walletAddress = walletData.account;
												if(activeAdmin.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
													toastNotify({
														state: 'error',
														message: 'you need a contract ownership',
													});
													return;
												}

												setLoading(true);
												await changeStateFunction({state: 'invalid', walletData, selectedQuest, selectedAnswer, description: invalidDesc, setQr, setQrModal, setMinutes, setSeconds});
												setLoading(false);

												modalInvalid(false);
											}
										}>
											Confirm
										</a>
									</p>
								</div>
							</fieldset>
						</form>
					</div>
				</Modal>
				{/* 모달 - INVALID Description 끝 */}

				{/* GRANT ADMIN - TAB02 시작*/}
				<div className="market-admin" style={{ display: 'none' }}>
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
								<SwiperSlide 
									key={0} 
									onClick={() => {
										if(!selectedAdmin?._id) {
											toastNotify({
												state: 'error',
												message: 'select member for grant'
											})
											return;
										}

										transferAdmin(selectedAdmin);
									}} 
									style={{cursor:'pointer'}}
								>
									GRANT ADMIN
								</SwiperSlide>
							}
							</Swiper>
							</dt>
							<dd>
							</dd>
						</dl>
					</div>
					{/* 카테고리 영역 끝 */}

					<div className="mc-admin">
						<div>
							<ul>
								<li key='1'><strong></strong></li>
								<li key='2'><strong>No.</strong></li>
								<li key='3'><strong>Wallet Address</strong></li>
								<li key='4'><strong>Active</strong></li>
							</ul>
							{
								admins?.map((admin, index) => (
									<ul key={index} style={{ background : index === 0 ? '#6363' : '' }}>
										<li key='1'>
										{
											index !== 0 &&
											<input type="checkbox" onChange={() => { setSelectedAdmin(admin) }} checked={admin._id === selectedAdmin?._id}/>
										}	
										</li>
										<li key='2'><span>No. : </span> {index + 1} </li>
										<li key='3'><span>Wallet Address : </span> {admin.walletAddress} </li>
										<li key='4'><span>Active : </span> {admin.active ? 'Active' : 'Inactive'} </li>
									</ul>
								))
							}
						</div>
					</div>
				</div>
				{/* GRANT ADMIN - TAB02 끝 */}

				{/* POP UP - TAB03 시작*/}
				<div className="market-admin-popup" style={{ display: 'none' }}>
					<div className="mc-admin">
						<div>
							<ul>
								<li key='1'><strong>No.</strong></li>
								<li key='2'><strong>Title</strong></li>
								<li key='3'><strong>Content</strong></li>
							</ul>
							{
								popups?.map((popup, index) => (
									<ul key={index} style={{ cursor: 'pointer' }}>
										<li key='1'><span>No. : </span> {index + 1} </li>
										<li key='2'><span>Title : </span> {popup.title} </li>
										<li key='3'><span>Content : </span> {popup.content} </li>
									</ul>
								))
							}
						</div>
					</div>
				</div>
				{/* POP UP ADMIN - TAB03 끝 */}
		</div>
	);
}

function tabOpen01() {
	document.querySelector('.category-section').style.display = 'block';
	document.querySelector('.mypage-info').style.display = 'block';
	document.querySelector('.market-content').style.display = 'block';

	document.querySelector('.market-admin').style.display = 'none';

	document.querySelector('.market-admin-popup').style.display = 'none';

	document.querySelector('.mt-tab01').classList.add("active");
	document.querySelector('.mt-tab02').classList.remove("active");
	document.querySelector('.mt-tab03').classList.remove("active");
}

function tabOpen02() {
	document.querySelector('.market-admin').style.display = 'block';
	
	document.querySelector('.category-section').style.display = 'none';
	document.querySelector('.mypage-info').style.display = 'none';
	document.querySelector('.market-content').style.display = 'none';

	document.querySelector('.market-admin-popup').style.display = 'none';

	document.querySelector('.mt-tab01').classList.remove("active");
	document.querySelector('.mt-tab02').classList.add("active");
	document.querySelector('.mt-tab03').classList.remove("active");
}

function tabOpen03() {
	document.querySelector('.market-admin-popup').style.display = 'block';

	document.querySelector('.market-admin').style.display = 'none';
	
	document.querySelector('.category-section').style.display = 'none';
	document.querySelector('.mypage-info').style.display = 'none';
	document.querySelector('.market-content').style.display = 'none';

	document.querySelector('.mt-tab01').classList.remove("active");
	document.querySelector('.mt-tab02').classList.remove("active");
	document.querySelector('.mt-tab03').classList.add("active");
}

function addComma(data) {
	if(!data) return 0;

	return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default Index;
