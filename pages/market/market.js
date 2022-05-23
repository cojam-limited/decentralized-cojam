//import { Link } from 'react-router-dom'
import React, { useState, useEffect } from 'react';
import { Modal } from 'react-responsive-modal';

import { Link, useHistory } from 'react-router-dom'
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import { client, urlFor } from "../../sanity";
import 'react-responsive-modal/styles.css';
import backgroundImage from '@assets/body_mypage.jpg';
import { useWalletData } from '@data/wallet';
import { useLoadingState } from "@assets/context/LoadingContext";
import { changeStateFunction } from './statusFunctions';

import { transferOwnership } from '@api/UseKaikas';

import Moment from 'moment';

function Index() {
	const history = useHistory();
	const [ openDetail, modalDetail ] = useState(false);
	const { setLoading } = useLoadingState();
	const { walletData } = useWalletData();
	const [ transactionDatas, setTransactionDatas ] = useState([]);
	const [ memberDatas, setMemberDatas ] = useState([]);
	
	const [ categories, setCategories ] = useState([]);
	const [ activeCategory, setActiveCategory ] = useState('ONGOING');
	const [ activeDetailData, setActiveDetailData ] = useState({});
	const [ selectedQuest, setSelectedQuest ] = useState([]);

	const [ openSuccess, modalSuccess ] = useState(false);
	const [ selectedAnswer, setSelectedAnswer ] = useState({});

	const stateButtons = {
		ONGOING: ['pend', 'unpend', 'invalid', 'draft', 'answer', 'approve'],
		INVALID: [],
		APPROVE: ['hot', 'pend', 'unpend', 'finish', 'adjourn', 'success'],
		ADJOURN: ['retrieve'],
		SUCCESS: ['retrieve']
	}

	const clickStateButton = async (state) => {
		if(selectedQuest.length === 0) {
			alert('choose the quest to change the state');
			return;
		}

		// modal 통해서 진행해야하는 status
		if(state === 'success') {
			loadDetailData(selectedQuest.questKey, false);
			modalSuccess(true);
			return;
		}

		setLoading(true);
		await changeStateFunction(state, walletData, selectedQuest);
		setLoading(false);
	}

	const transferAdmin = async (member) => {
		const walletAddress = member.walletAddress;

		if(window.confirm(`[${walletAddress}] transfer to admin ?`)) {
			const result = await transferOwnership(walletAddress);

			if(result.status === 200) {
				alert('transfer to admin success');
				
				client.patch(member._id)
					  .set({ memberRole: 'admin' })
					  .commit();

			} else {
				alert('transfer to admin failed');
			}
		}
	}
	
	/**
	 * title 클릭 시, Quest 디테일 조회
 	*/
	const loadDetailData = (questKey, openDetailModal) => {
		 setLoading(true);
		 const questQuery = `*[_type == 'quests' && questKey == ${questKey}][0] {..., 'answerKeys': *[_type=='questAnswerList' && questKey == ^.questKey] { title, questAnswerKey } | order(questAnswerKey asc)}`;
		 client.fetch(questQuery).then((quest) => {

			 const seasonQuery = `*[_type == 'season' && _id == '${quest.season?._ref}'][0]`
			 client.fetch(seasonQuery).then((season) => {
				const detailDatas = {
					questKey: quest.questKey,
					imageFile: quest.imageFile,
					title: quest.title,
					categoryName: quest.categoryName,
					status: quest.questStatus,
					description: quest.description,
					draftTx: quest.draftTx,
					answerTx: quest.answerTx,
					approveTx: quest.approveTx,
					adjournTx: quest.adjournTx,
					successTx: quest.successTx,
					successDateTime: quest.successDateTime,
					answers: quest.answerKeys,
					totalAmount: quest.totalAmount,
					creatorAddress: quest.creatorAddress,

					seasonTitle: season.title,
					seasonDesc : season.description,
					cojamFee: season.cojamFee,
					charityFee: season.charityFee,
					creatorFee: season.creatorFee,
					creatorPay: season.creatorPay,
					minimumPay: season.minimumPay,
					maximumPay: season.maximumPay,
					'openDetailModal': openDetailModal
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

	useEffect(() => {
		setLoading(true);
		const walletAddress = walletData.account;

		if(walletAddress === '') {
			alert('logout.');
			history.push('/');
		}
		
		let subscription;
		if(walletAddress) {
			const condition = `${activeCategory === '' ? '' : `&& questStatus == '${activeCategory.toUpperCase()}'`}`;
			const questQuery = `*[_type == 'quests' ${condition}] { ..., 'categoryNm': *[_type=='seasonCategories' && _id == ^.seasonCategory._ref]{seasonCategoryName}[0] } | order(questKey desc)`;
			client.fetch(questQuery).then((quest) => {
				console.log('first quest', quest);
				setTransactionDatas(quest ?? []);
				setLoading(false);
			});	

			/*
			subscription = client.listen(questQuery).subscribe((quest) => {
				console.log('subscription quest', quest);
				setTransactionDatas(quest ?? []);
			});	
			*/

			// get member data & check current account member role
			const memberQuery = `*[_type == 'member']`;
			client.fetch(memberQuery).then((members) => {
				members.forEach((member) => {
					if(member.walletAddress === walletAddress) {
						if(member.memberRole !== 'admin') {
							alert('this account is not admin.');
							history.push('/');
						}
					}
				});

				setMemberDatas(members ?? []);
			});
		}

		setSelectedQuest([]);
		//return () => subscription?.unsubscribe();
	}, [walletData, activeCategory]);

	return (
		<div className="bg-mypage" style={{background: `url('${backgroundImage}') center -590px no-repeat, #eef0f8 `}}>

				{/* 타이틀영역 */}
				<div className="title-area">
					ADMIN
				</div>
				{/* 타이틀영역 끝 */}

				{/* 마이페이지 - 탭버튼 */}
				<ul className="markets-tab">
					<li className="mt-tab01 active" onClick={tabOpen01}><i className="uil uil-chart-line"></i> <span>Cojam Ground</span></li>
					<li className="mt-tab02" onClick={tabOpen02}><i className="uil uil-files-landscapes-alt"></i> <span>Grant Admin</span></li>
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
								<li key='1'><strong>No.</strong></li>
								<li key='2'><strong>Category</strong></li>
								<li key='3'><strong>Title</strong></li>
								<li key='4'><strong>End Date</strong></li>
								<li key='5'><strong>Total(minimum)</strong></li>
								<li key='6'><strong>Pend </strong></li>
								<li key='7'><strong>Hot </strong></li>
							</ul>

							{
								transactionDatas?.map((transactionData, index) => (
									<ul key={index} onClick={() => { setSelectedQuest(transactionData); }} style={{ background: transactionData._id === selectedQuest._id ? '#2132' : '' }} >
										<li key='1'><span>No. : </span> {index + 1} </li>
										<li key='2'><span>Category : </span> {transactionData.categoryNm?.seasonCategoryName} </li>
										<li key='3' onClick={() => { loadDetailData(transactionData.questKey, true); }} style={{ cursor: 'pointer' }}><span>Title : </span> {transactionData.title} </li>
										<li key='4'><span>End Date : </span> {Moment(transactionData.endDateTime).format('YYYY-MM-DD HH:mm:ss')} </li>
										<li key='5'><span>Total(minimum) : </span> {transactionData.totalAmount} ({transactionData.minimumPay})</li>
										<li key='6'><span>Pend : </span> { transactionData.pending ? 'T' : 'F' } </li>
										<li key='7'><span>Hot : </span> { transactionData.hot ? 'T' : 'F' } </li>
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
												<li>
													<img src={activeDetailData.imageFile && urlFor(activeDetailData.imageFile)} width="100%"/>
												</li>
												<li>
													<span>Title(English)</span>
													<input name="name" type="text" className="w100p" placeholder="" readOnly/>
												</li>
												<li>
													<span>Title(Korean)</span>
													<input name="name" type="text" className="w100p" placeholder="" readOnly defaultValue={activeDetailData.title}/>
												</li>
												<li>
													<span>Title(Chinese)</span>
													<input name="name" type="text" className="w100p" placeholder="" readOnly/>
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
															<input key={index} name="name" type="text" className="w100p" placeholder="" readOnly defaultValue={answer.title}/>
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

				{/* 모달 - SUCCESS */}
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
															<input key={index} name="name" type="text" className="w100p" placeholder="" style={{ color: 'black', cursor: 'pointer', background: answer.title === selectedAnswer.title ? '#8950fc' : '' }} onClick={() => {setSelectedAnswer(answer)}} readOnly defaultValue={answer.title}/>
														))
													}	
												</li>
											</>
										}
									</ul>
									<p>
										<a href="#" onClick={() => modalSuccess(false)}>Confirm</a>
									</p>
								</div>
							</fieldset>
						</form>
					</div>
				</Modal>
				{/* 모달 - SUCCESS 끝 */}

				{/* GRANT ADMIN - TAB02 시작*/}
				<div className="market-admin" style={{ display: 'none' }}>
					<div className="mc-admin">
						<div>
							<ul>
								<li key='1'><strong>No.</strong></li>
								<li key='2'><strong>Wallet Address</strong></li>
								<li key='3'><strong>Member Role</strong></li>
								<li key='4'><strong>Del Yn</strong></li>
							</ul>
							{
								memberDatas?.map((memberData, index) => (
									<ul key={index} style={{ cursor: 'pointer' }} onClick={() => transferAdmin(memberData)} >
										<li key='1'><span>No. : </span> {index + 1} </li>
										<li key='2'><span>Wallet Address : </span> {memberData.walletAddress} </li>
										<li key='3'><span>Member Role : </span> {memberData.memberRole} </li>
										<li key='4'><span>Del Yn : </span> {memberData.delYn} </li>
									</ul>
								))
							}
						</div>
					</div>
				</div>
				{/* GRANT ADMIN - TAB02 끝 */}
		</div>
	);
}

function tabOpen01() {
	document.querySelector('.category-section').style.display = 'block';
	document.querySelector('.mypage-info').style.display = 'block';
	document.querySelector('.market-content').style.display = 'block';

	document.querySelector('.market-admin').style.display = 'none';

	document.querySelector('.mt-tab01').classList.add("active");
	document.querySelector('.mt-tab02').classList.remove("active");
}

function tabOpen02() {
	document.querySelector('.market-admin').style.display = 'block';
	
	document.querySelector('.category-section').style.display = 'none';
	document.querySelector('.mypage-info').style.display = 'none';
	document.querySelector('.market-content').style.display = 'none';

	document.querySelector('.mt-tab01').classList.remove("active");
	document.querySelector('.mt-tab02').classList.add("active");
}

export default Index;
