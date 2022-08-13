import React, { useEffect, useState, useContext } from 'react';
import { Modal } from 'react-responsive-modal';

import 'react-responsive-modal/styles.css';
import backgroundImage from '@assets/body_mypage.jpg';
import { useWalletData } from '@data/wallet';
import { client, urlFor } from '../../sanity';
import { useLoadingState } from "../../assets/context/LoadingContext";
import Moment from 'moment';
import { getRewardCojamURI, receiveToken } from "@api/UseKaikas";
import toastNotify from '@utils/toast';
import { callGetCojamBalance, callReceiveToken } from '../../api/UseTransactions';
import { BalanceContext } from '../../components/Context/BalanceContext';
import { QrContext } from '../../components/Context/QrContext';

import LogoBlack from '@assets/coin.png'

function Index() {
	const { setLoading } = useLoadingState();
	const { setQr, setQrModal, setMinutes, setSeconds } = useContext(QrContext);
	const { balance, setBalance } = useContext(BalanceContext);
	const [ reloadData, setReloadData ] = useState(false);
	const [ openMypageVoting, modalMypageVoting ] = useState(false);
	const [ openMypageGround, modalMypageGround ] = useState(false);
	const [ openMypageTransfer, modalMypageTransfer ] = useState(false);
	const [ openQuestReward, modalQuestReward ] = useState(false);

	const stateList = ['ONGOING', 'INVALID', 'APPROVE', 'ADJOURN', 'SUCCESS'];
	const [ votings, setVotings ] = useState({votingSet: []});
	const [ selectedVoting, setSelectedVoting ] = useState({});
	const [ grounds, setGrounds ] = useState([]);

	const [ selectedGround, setSelectedGround ] = useState({});
	const [ transfers, setTransfers ] = useState([]);
	const [ selectedTransfer, setSelectedTransfer ] = useState({});
	const [ hadLoginReward, setHadLoginReward ] = useState(false);
	const { walletData } = useWalletData();

	/**
	 * load voting infos
	 */
	const loadVotings = async () => {
		const walletAddress = walletData.account;
		const votingArr = [];

		const votingQuery = `*[_type == 'betting' && memberKey == '${String(walletAddress).toUpperCase()}' && _id != '${Date.now()}'] {..., 'answer': *[_type=='questAnswerList' && _id == ^.questAnswerKey && ^._id != '${Date.now()}'][0] {title, totalAmount} } | order(_createdAt desc)`;
		await client.fetch(votingQuery).then(async (votingDatas) => {
			votingDatas.forEach(async (votingData) => {
				const questQuery = `*[_type == 'quests' && questKey == ${votingData.questKey} && _id != '${Date.now()}'][0] { ..., 'categoryNm': *[_type=='seasonCategories' && _id == ^.seasonCategory._ref]{seasonCategoryName}[0] }`;
				await client.fetch(questQuery).then((quest) => {
					if(quest) {
						const multiply = quest.questStatus === 'ADJOURN' ? 
										  1 
										: ((quest.totalAmount
											- (quest.totalAmount * quest.cojamFee / 100)
											- ((quest.totalAmount * quest.creatorFee / 100) + quest.creatorPay)
											- (quest.totalAmount * quest.charityFee / 100)) / votingData.answer.totalAmount).toFixed(2);

						const predictionFee = quest.questStatus === 'ADJOURN' ? 
												votingData.bettingCoin
											:	(multiply * votingData.bettingCoin).toFixed(2);

						const votingSet = {
							categoryNm: quest.categoryNm.seasonCategoryName,
							questKey: quest.questKey,
							questStatus: quest.questStatus,
							questTitle: quest[`title${quest.questLanguage}`],
							approveTx: quest.approveTx,
							adjournTx: quest.adjournTx,
							successTx: quest.successTx,
							answerList: quest.answers,
							imageFile: quest.imageFile,
							imageUrl: quest.imageUrl,
							imageLink: quest.imageLink,
							spenderAddress: quest.creatorAddress,
							selectedAnswer: quest.selectedAnswer,

							hot: quest.hot,						
							pending: quest.pending,

							bettingTx: votingData.transactionId,
							answerTitle: votingData.answer.title,
							bettingKey: votingData.bettingKey,
							bettingCoin: votingData.bettingCoin,
							receiveAddress: votingData.receiveAddress ?? '',
							multiply: multiply,
							predictionFee: predictionFee,
							_id: votingData._id
						}
						
						votingArr.push({ ...votingSet });
						votingArr.sort(function compare(a, b) {
							if(a.bettingKey > b.bettingKey) {
								return -1;
							} else {
								return 1;
							}
						});

						setVotings( {...votings, votingSet: [...votings.votingSet, ...votingArr]} );
					} 
				});
			});
			
			setLoading(false);
		});
	}

	/**
	 * Login reward
	 */
	const getLoginReward = () => {
		const walletAddress = walletData.account;

		if(walletAddress) {
			// 9 hours after
			const creteriaDate = Moment().add('9', 'h').format("yyyy-MM-DD");
			const loginRewardHistQuery = `*[_type == 'loginRewardHistory' && walletAddress == '${walletAddress}' && loginDate == '${creteriaDate}' && _id != '${Date.now()}'][0]`;
			client.fetch(loginRewardHistQuery).then((loginRewardHistory) => {
				// check if user got join reward. before 9 hours.
				if(loginRewardHistory || hadLoginReward) {
					toastNotify({
						state: 'error',
						message: "you've got login reward already.",
					});
				} else {
					const rewardInfoQuery = `*[_type == 'rewardInfo' && isActive == true && rewardType == 'login' && _id != '${Date.now()}'][0]`;
					client.fetch(rewardInfoQuery).then(async (rewardInfo) => {
						if(!rewardInfo.amount) {
							toastNotify({
								state: 'error',
								message: 'login reward amount is not exist',
							});
							return;
						}

						// send coin from master wallet
						let transferRes;
						//const rewardAddress = '0xfA4fF8b168894141c1d6FAf21A58cb3962C93B84'; // dev KAS reward wallet
						const rewardAddress = '0x62CF255C71D23EbC116B47bFC9801A167536136C'; // prod KAS reward wallet
						try {
							transferRes = await getRewardCojamURI({fromAddress: rewardAddress, toAddress: walletAddress, amount: Number(rewardInfo.amount)});
						} catch(error) {
							toastNotify({
								state: 'error',
								message: 'transfer api error. try again.',
							});
							return;
						}

						if(transferRes.status === 200) {
							const cojamBalance = await callGetCojamBalance(walletData);
							if(cojamBalance !== balance) {
								setBalance(cojamBalance);
							}

							// remain transfer history
							const loginRewardHistoryDoc = {
								_type: 'loginRewardHistory',
								walletAddress: walletAddress,
								loginDate: creteriaDate,
								rewardAmount: Number(rewardInfo.amount),
								transactionId: transferRes.transactionId,
								createDatedTime: Moment().format("yyyy-MM-DD HH:mm:ss")
							}

							await client.create(loginRewardHistoryDoc);

							// remain transaction history
							const transactionSet = {
								_type: 'transactions',
								amount: Number(rewardInfo.amount),
								recipientAddress: walletAddress,
								spenderAddress: rewardAddress,
								status: 'SUCCESS',
								transactionId: transferRes.transactionId,
								transactionType: 'LOGIN_REWARD',
								createdDateTime: Moment().format('YYYY-MM-DD HH:mm:ss'),
							}

							await client.create(transactionSet);

							setReloadData(!reloadData);

							toastNotify({
								state: 'success',
								message: 'get login reward successfully!',
							});

							// refresh after get reward success.
							window.location.reload();
						} else {
							toastNotify({
								state: 'error',
								message: 'get login reward failed.',
							});
						}
					});
				}
			});
		} else {
			toastNotify({
				state: 'error',
				message: 'login first. please',
			});
		}
	}

	// GET QUEST REWARD
	const getQuestReward = async () => {
		if(selectedVoting.result || selectedVoting.questStatus === 'ADJOURN') {
			// send coin from master wallet
			const walletAddress = walletData.account;

			let transferRes;
			try {
				setLoading(true);
				transferRes = await callReceiveToken(walletData, selectedVoting.questKey, selectedVoting.bettingKey, setQr, setQrModal, setMinutes, setSeconds);
			} catch(error) {
				setLoading(false);
				toastNotify({
					state: 'error',
					message: 'receive token error. try again.',
				});
				return;
			}

			if(transferRes.status === 200) {
				const cojamBalance = await callGetCojamBalance(walletData);
				if(cojamBalance !== balance) {
					setBalance(cojamBalance);
				}

				// remain transaction history
				const transactionSet = {
					_type: 'transactions',
					amount: Number(selectedVoting.predictionFee),
					recipientAddress: walletAddress,
					spenderAddress: transferRes.spenderAddress,
					status: 'SUCCESS',
					transactionId: transferRes.transactionId,
					transactionType: 'QUEST_REWARD',
					createdDateTime: Moment().format('YYYY-MM-DD HH:mm:ss'),
				}

				await client.create(transactionSet);

				await client.patch(selectedVoting._id)
							.set({ receiveAddress: walletAddress })
							.commit();

				setLoading(false);
				toastNotify({
					state: 'success',
					message: 'get quest reward successfully!',
				});
				
				// refresh after get reward success.
				//setReloadData(!reloadData);
				window.location.reload();
			} else {
				setLoading(false);
				toastNotify({
					state: 'error',
					message: 'get quest reward failed.',
				});
			}
		} else {
			toastNotify({
				state: 'error',
				message: 'choose wrong. try another quest!',
			});
		}
	}

	/**
	 * Load Voting, Grounds, Transfer infos
	 */
	useEffect(() => {
		const walletAddress = walletData.account;

		setLoading(true);
		
		async function fetchVoting() {
			await loadVotings();			
		}
		fetchVoting();

		const groundQuery = `*[_type == 'quests' && creatorAddress == '${walletAddress}' && isActive == true && _id != '${Date.now()}'] {..., 'seasonNm': *[_type=='season' && _id == ^.season._ref]{title}[0], 'categoryNm': *[_type=='seasonCategories' && _id == ^.seasonCategory._ref]{seasonCategoryName}[0] } | order(_updatedAt desc)`;
		client.fetch(groundQuery).then((grounds) => {
			setGrounds(grounds);
		});

		const transferQuery = `*[_type == 'transactions' && spenderAddress == '${walletAddress}' || recipientAddress == '${walletAddress}' && _id != '${Date.now()}' ] | order(_updatedAt desc)`;
		client.fetch(transferQuery).then((transfers) => {
			setTransfers(transfers);
		});

		let subscription;
		if(walletAddress) {
			const loginRewardHistQuery = `*[_type == 'loginRewardHistory' && walletAddress == '${walletAddress}' && _id != '${Date.now()}']`;
			subscription = client.listen(loginRewardHistQuery).subscribe((rewardHistory) => {
				setHadLoginReward(rewardHistory.result);
			});	
		}

		return () => subscription?.unsubscribe();
	}, [walletData, reloadData]);

  	return (
    	<div className="bg-mypage" style={{background: `url('${backgroundImage}') center -590px no-repeat, #eef0f8 `}}>

			{/* 타이틀영역 */}
			<div className="title-area">
				mypage
			</div>
			{/* 타이틀영역 끝 */}


			{/* 마이페이지 - 기본정보 */}
			<div className="mypage-info">
				<dt>
					<div><i className="uil uil-wallet"></i> Wallet address : <span> { walletData?.account }</span></div>
				</dt>
				<dd>
					<a href="#" className="btn-red" onClick={() => getLoginReward()}>Login Reward</a>
					{/*<a href="#" className="btn-blue" onClick={() => getReward()}>Click to be Reward!</a>*/}
				</dd>
			</div>
			{/* 마이페이지 - 기본정보 끝 */}


			{/* 마이페이지 - 탭버튼 */}
			<ul className="mypage-tab">
				<li className="mt-tab01 active" onClick={tabOpen01}><i className="uil uil-chart-line"></i> <span>Votings</span></li>
				<li className="mt-tab02" onClick={tabOpen02}><i className="uil uil-files-landscapes-alt"></i> <span>Grounds</span></li>
				<li className="mt-tab03" onClick={tabOpen03}><i className="uil uil-file-info-alt"></i> <span>CT Transfer</span></li>
			</ul>
			{/* 마이페이지 - 탭버튼 끝 */}


			{/* 마이페이지 - 내용 */}
			<div className="mypage-content">
				{/* VOTINGS PAGE START */}
				<div className="mc-votings">
					<h2><span>Votings</span></h2>
					<div>
						<ul>
							<li><strong>Reward</strong></li>
							<li><strong>Category</strong></li>
							<li><strong>Title</strong></li>
							<li><strong>Status Flow</strong></li>
							<li><strong>My Answer</strong></li>
							<li><strong>Multiply</strong></li>
							<li><strong>Prediction Fee</strong></li>
						</ul>

						{
							votings.votingSet?.map((voting, index) => {
								let statePass = false;

								return (
									<ul key={index}>
										<li key='0' 
											style={{ cursor: 'pointer' }} 
											onClick={() => {  
												if(voting.questStatus !== 'ADJOURN') {
													if(!voting.selectedAnswer) {
														toastNotify({
															state: 'error',
															message: "answer is not selected.",
														});
														return;
													}
												}

												if(voting.receiveAddress && voting.receiveAddress !== '') { 
													toastNotify({
														state: 'info',
														message: "you've got reward already",
													});
													return; 
												}
												
												setSelectedVoting({...voting, result: voting.selectedAnswer === voting.answerTitle}); 
												modalQuestReward(true); 
											}}>
											<div className='mc-votings-result' style={{ 
												background: voting.selectedAnswer 
															?	(voting.selectedAnswer === voting.answerTitle 
																	? voting.receiveAddress !== '' 
																		? '#FFB63F' // answer correct received
																		: '#F591E2' // answer correct not-received
																	: '#DFDFDF') 
															:	(voting.questStatus === 'ADJOURN' 
																	? voting.receiveAddress !== '' 
																		? '#FFB63F'  // adjourn received
																		: '#3813CD'  // adjourn not-received
																	: 'white'),
												border: voting.selectedAnswer 
														? '' 
														: (voting.questStatus === 'ADJOURN' 
																? voting.receiveAddress !== '' 
																	? '2px solid #636363'
																	: '' 
																: '2px solid #3636')
												// pink : F591E2, orange: FFB63F, indigo: 3813CD, 																
											}} />
										</li>
										<li key='1'><span>Category : </span>{voting.categoryNm}</li>
										<li key='2' style={{ cursor: 'pointer' }} onClick={() => { setSelectedVoting(voting); modalMypageVoting(true); }}><span>Title : </span>{voting.questTitle}</li>
										<li key='3'>
											{voting.pending && <p>Pending</p>}
											{voting.questStatus === 'INVALID' && <p>INVALID</p>}
											{voting.questStatus === 'ADJOURN' && <p>ADJOURN</p>}
											<span>Status Flow : </span>
											<ul>
											{
												stateList.map((state, index) => {
													let complete = statePass ? '' : 'complete';
													if(state === voting.questStatus) {
														statePass = true;
														complete = 'ing';
													}

													return (
														<li key={index} className={ complete }>
															<span></span>
															<h2>{state}</h2>
														</li>
													)
												})
											}
											</ul>
										</li>
										<li key='4'><span>My Answer : </span> {voting.answerTitle} ({voting.bettingCoin} CT)</li>
										<li key='5'><span>Multiply : </span>{voting.multiply}</li>
										<li key='6'><span>Prediction Fee : </span>{voting.predictionFee} CT</li>
									</ul>
								)
							})
						}
					</div>
				</div>
				{/* VOTINGS PAGE END */}

				{/* GROUND PAGE START */}
				<div className="mc-grounds">
					<h2><span>Grounds</span></h2>
					<div>
						<ul>
							<li><strong>Category</strong></li>
							<li><strong>Title</strong></li>
							<li><strong>Status Flow</strong></li>
							<li><strong>Total</strong></li>
							<li><strong>Total Creator Fee</strong></li>
							<li><strong>Donation Fee</strong></li>
						</ul>

						{
							grounds?.map((ground, index) => {
								let statePass = false;
								return (
									<ul key={index}>
										<li key='1'><span>Category : </span> { ground.categoryNm.seasonCategoryName } </li>
										<li key='2' style={{ cursor: 'pointer' }} onClick={() => { setSelectedGround(ground); modalMypageGround(true); }}><span>Title : </span> { ground[`title${ground.questLanguage}`] } </li>
										<li key='3'>
											{ground.pending && <p>Pending</p>}
											{ground.questStatus === 'INVALID' && <p>INVALID</p>}
											{ground.questStatus === 'ADJOURN' && <p>ADJOURN</p>}
											<span>Status Flow : </span>
											<ul>
												{
													stateList.map((state, index) => {
														let complete = statePass ? '' : 'complete';
														if(state === ground.questStatus) {
															statePass = true;
															complete = 'ing';
														}

														return (
															<li key={index} className={ complete }>
																<span></span>
																<h2>{state}</h2>
															</li>
														)
													})
												}
											</ul>
										</li>
										<li key='4'><span>Total  : </span>{ ground.totalAmount } CT</li>
										<li key='5'><span>Total Creator Fee : </span> { Number(ground.totalAmount * ground.creatorFee / 100).toFixed(2) } CT ({ ground.creatorFee } %)</li>
										<li key='6'><span>Donation Fee : </span>{ Number(ground.totalAmount * ground.charityFee / 100).toFixed(2) } CT ({ ground.charityFee } %)</li>
									</ul>
								)
							})
						}
					</div>
				</div>
				{/* GROUND PAGE END */}
				
				{/* CT TRANSFER PAGE START */}
				<div className="mc-transfer">
					<h2><span>CT Transfer</span></h2>
					<div>
						<ul>
							<li key='1'><strong>Spender Address</strong></li>
							<li key='2'><strong>Recipient Address</strong></li>
							<li key='3'><strong>CT Amount</strong></li>
							<li key='4'><strong>Created DTTM</strong></li>
						</ul>
						{
							transfers?.map((transfer, index) => (
								<ul key={index} style={{ cursor: 'pointer' }} onClick={() => { setSelectedTransfer(transfer); modalMypageTransfer(true);}}>
									<li key="1"><span>Spender Address : </span>{transfer.spenderAddress}</li>
									<li key="2"><span>Recipient Address : </span>{transfer.recipientAddress}</li>
									<li key="3"><span>CT Amount : </span>{transfer.amount} CT</li>
									<li key="4"><span>Created DTTM : </span>{transfer.createdDateTime}</li>
								</ul>
							))
						}
					</div>
				</div>
				{/* CT TRANSFER PAGE END */}
			</div>
			{/* 마이페이지 - 내용 끝 */}

			{/* 모달 - 마이페이지 - Voting 상세 */}
			<Modal open={openMypageVoting} onClose={() => modalMypageVoting(false)} center>
				<div className="modal-mypage-view">
					<form name="addForm" method="post" action="">
						<fieldset>
							<legend>Voting Detail</legend>
							<div className="mmv-area">
								<dl>
									<dt>Voting Detail</dt>
									<dd><i className="uil uil-times" style={{ cursor: 'pointer' }} onClick={() => modalMypageVoting(false)}></i></dd>
								</dl>
								<ul>
									<li key='0'>
										<img 
											src={
												selectedVoting.imageFile 
													? urlFor(selectedVoting.imageFile)
													: selectedVoting.imageUrl ?? '' 
											} 
											width="100%"
											onClick={() => {
												if(selectedVoting?.imageLink && selectedVoting?.imageLink !== '') {
													const toUrl = selectedVoting?.imageLink.indexOf('http') === -1 
																? `https://${selectedVoting?.imageLink}` 
																: `${selectedVoting?.imageLink}`;
			
													window.open(toUrl, '_blank').focus();
												} 
											}} 
	
											style={{ 
												cursor: selectedVoting?.imageLink ? 'pointer' : ''
											}}
										/>
									</li>
									<li key='1'>
										<span>Title</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedVoting.title}/>
									</li>
									<li key='2'>
										<span>Category</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedVoting.categoryNm}/>
									</li>
									<li key='3'>
										<span>Status</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedVoting.questStatus}/>
									</li>
									<li key='4'>
										<span>Approve Transaction</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedVoting.approveTx}/>
									</li>
									<li  key='5'>
										<span>Adjourn Transaction</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedVoting.adjournTx}/>
									</li>
									<li key='6'>
										<span>Success Transaction</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedVoting.successTx}/>
									</li>
									<li key='7'>
										<span>Answer List</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedVoting.answerList}/>
									</li>
									<li key='8'>
										<span>My Answer</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedVoting.answerTitle}/>
									</li>
									<li key='9'>
										<span>Selected Answer</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedVoting.selectedAnswer}/>
									</li>
									<li key='10'>
										<span>Spender Address</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedVoting.spenderAddress}/>
									</li>
									<li key='11'>
										<span>Voting Transaction</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedVoting.bettingTx}/>
									</li>
								</ul>
								<p>
									<a href="#" onClick={() => modalMypageVoting(false)}>Confirm</a>
								</p>
							</div>
						</fieldset>
					</form>
				</div>
			</Modal>
			{/* 모달 - 마이페이지 - Voting 상세 끝 */}


			{/* 모달 - 마이페이지 - Ground 상세 */}
			<Modal open={openMypageGround} onClose={() => modalMypageGround(false)} center>
				<div className="modal-mypage-view">
					<form name="addForm" method="post" action="">
						<fieldset>
							<legend>Ground Detail</legend>
							<div className="mmv-area">
								<dl>
									<dt>Ground Detail</dt>
									<dd><i className="uil uil-times" style={{ cursor: 'pointer' }} onClick={() => modalMypageGround(false)}></i></dd>
								</dl>
								<ul>
									<li key='0'>
										<img 
											src={
												selectedGround.imageFile 
													? urlFor(selectedGround.imageFile)
													: selectedGround.imageUrl ?? '' 
											} 
											width="100%"
											onClick={() => {
												if(selectedGround?.imageLink && selectedGround?.imageLink !== '') {
													const toUrl = selectedGround?.imageLink.indexOf('http') === -1 
																? `https://${selectedGround?.imageLink}` 
																: `${selectedGround?.imageLink}`;
			
													window.open(toUrl, '_blank').focus();
												} 
											}} 
	
											style={{ 
												cursor: selectedGround?.imageLink ? 'pointer' : ''
											}}
										/>
									</li>
									<li key='1'>
										<span>Title</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedGround.title} />
									</li>
									<li key='2'>
										<span>Category</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedGround.categoryNm?.seasonCategoryName} />
									</li>
									<li key='3'>
										<span>Status</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedGround.statusType} />
									</li>
									<li key='4'>
										<span>Description</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedGround.description} />
									</li>
									<li key='5'>
										<span>Approve Transaction</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedGround.approveTx} />
									</li>
									<li key='6'>
										<span>Adjourn Transaction</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedGround.adjournTx} />
									</li>
									<li key='7'>
										<span>Success Transaction</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedGround.successTx} />
									</li>
									<li key='8'>
										<span>Answer List</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedGround.answers} />
									</li>
									<li key='9'>
										<span>Selected Answer</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedGround.title} />
									</li>
									<li key='10'>
										<span>Season</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedGround.seasonNm?.title} />
									</li>
								</ul>
								<p>
									<a href="#" style={{ cursor: 'pointer' }} onClick={() => modalMypageGround(false)}>Confirm</a>
								</p>
							</div>
						</fieldset>
					</form>
				</div>
			</Modal>
			{/* 모달 - 마이페이지 - Ground 상세 끝 */}


			{/* 모달 - 마이페이지 - Transfer 상세 */}
			<Modal open={openMypageTransfer} onClose={() => modalMypageTransfer(false)} center>
				<div className="modal-mypage-view">
					<form name="addForm" method="post" action="">
						<fieldset>
							<legend>CT Transfer</legend>
							<div className="mmv-area">
								<dl>
									<dt>CT Transfer Detail</dt>
									<dd><i className="uil uil-times" style={{ cursor: 'pointer' }} onClick={() => modalMypageTransfer(false)}></i></dd>
								</dl>
								<ul>
									<li key='1'>
										<span>Spender Address</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedTransfer.spenderAddress}/>
									</li>
									<li key='2'>
										<span>Recipient Address</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedTransfer.recipientAddress}/>
									</li>
									<li key='3'>
										<span>CT Amount</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedTransfer.amount}/>
									</li>
									<li key='4'>
										<span>Transaction</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedTransfer.transactionId}/>
									</li>
									<li key='5'>
										<span>Status</span>
										<input name="name" type="text" className="w100p" placeholder="" readOnly value={selectedTransfer.status}/>
									</li>
									<li key='6'>
										<span>DTTM</span>
										<input name="name" type="text" id="schDateTransfer" className="w100p date-icon" placeholder="" readOnly value={selectedTransfer.createdDateTime}/>
									</li>
								</ul>
								<p>
									<a href="#" onClick={() => modalMypageTransfer(false)}>Confirm</a>
								</p>
							</div>
						</fieldset>
					</form>
				</div>
			</Modal>
			{/* 모달 - 마이페이지 - Transfer 상세 끝 */}

			{/* 모달 - Reward 시작 */}
			<Modal open={openQuestReward} onClose={() => modalQuestReward(false)} center>
					<div className="modal-mypage-view"
						style={{ height: '500px', background: `url('${LogoBlack}') center -200px no-repeat, #fff`}}
					>
						<form name="addForm" method="post" action="">
							<fieldset>
								<legend>Get Reward</legend>
								<div className="mmv-area">
									<dl>
										<dt>Get Reward</dt>
										<dd><i className="uil uil-times" style={{ cursor: 'pointer' }} onClick={() => modalQuestReward(false)}></i></dd>
									</dl>
									<ul style={{ width: '2' }}>
										{/* <img src={LogoBlack} alt="" title="" /> */}
									</ul>
									<p>
										<a href="#" 
											onClick={async () => { 
												await getQuestReward();

												modalQuestReward(false); 
											}}
											style={{ position: 'absolute', bottom: 0, width: '93%', marginBottom: '10px' }}
										>
											Get Reward! ({selectedVoting.predictionFee} CT)
										</a>
									</p>
								</div>
							</fieldset>
						</form>
					</div>
				</Modal>
				{/* 모달 - Reward 끝 */}

			<div className="h70"></div>
    	</div>
  );
}


function tabOpen01() {
  	document.querySelector('.mc-votings').style.display = 'block';
	document.querySelector('.mc-grounds').style.display = 'none';
	document.querySelector('.mc-transfer').style.display = 'none';

	document.querySelector('.mt-tab01').classList.add("active");
	document.querySelector('.mt-tab02').classList.remove("active");
	document.querySelector('.mt-tab03').classList.remove("active");
}

function tabOpen02() {
  	document.querySelector('.mc-votings').style.display = 'none';
	document.querySelector('.mc-grounds').style.display = 'block';
	document.querySelector('.mc-transfer').style.display = 'none';

	document.querySelector('.mt-tab01').classList.remove("active");
	document.querySelector('.mt-tab02').classList.add("active");
	document.querySelector('.mt-tab03').classList.remove("active");
}

function tabOpen03() {
  	document.querySelector('.mc-votings').style.display = 'none';
	document.querySelector('.mc-grounds').style.display = 'none';
	document.querySelector('.mc-transfer').style.display = 'block';

	document.querySelector('.mt-tab01').classList.remove("active");
	document.querySelector('.mt-tab02').classList.remove("active");
	document.querySelector('.mt-tab03').classList.add("active");
}


export default Index;
