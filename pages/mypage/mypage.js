import React, { useEffect, useState } from 'react';
import { Modal } from 'react-responsive-modal';

import 'react-responsive-modal/styles.css';
import backgroundImage from '@assets/body_mypage.jpg';
import { useWalletData } from '@data/wallet';
import { client } from '../../sanity';
import { useLoadingState } from "../../assets/context/LoadingContext";
import Moment from 'moment';
import { transferCojamURI, getRewardCojamURI } from "@api/UseKaikas";
import { transferCojamURI_KLIP } from "@api/UseKlip";

function Index() {
	const { setLoading } = useLoadingState();
	const [openSendCT, modalSendCT] = useState(false);
	const [openMypageVoting, modalMypageVoting] = useState(false);
	const [openMypageGround, modalMypageGround] = useState(false);
	const [openMypageTransfer, modalMypageTransfer] = useState(false);

	const stateList = ['ONGOING', 'INVALID', 'APPROVE', 'ADJOURN', 'SUCCESS'];
	const [ votings, setVotings ] = useState({votingSet: []});
	const [ selectedVoting, setSelectedVoting ] = useState({});
	const [ grounds, setGrounds ] = useState([]);
	const [ selectedGround, setSelectedGround ] = useState({});
	const [ transfers, setTransfers ] = useState([]);
	const [ selectedTransfer, setSelectedTransfer ] = useState({});
	const [ hadLoginReward, setHadLoginReward ] = useState(false);

	const [ sendCTInput ] = useState({ recipientAddress: '', amount: 0 });

	const { walletData } = useWalletData();

	/**
	 * load voting infos
	 */
	const loadVotings = async () => {
		const walletAddress = walletData.account;
		const votingArr = [];

		const votingQuery = `*[_type == 'betting' && memberKey == '${walletAddress}'] {..., 'answerNm': *[_type=='questAnswerList' && _id == ^.questAnswerKey] [0]{title} }`;
		await client.fetch(votingQuery).then(async (votingDatas) => {
			votingDatas.forEach(async (votingData) => {
				const questQuery = `*[_type == 'quests' && questKey == ${votingData.questKey}][0] { ..., 'categoryNm': *[_type=='seasonCategories' && _id == ^.seasonCategory._ref]{seasonCategoryName}[0] }`;
				await client.fetch(questQuery).then((quest) => {
					if(quest) {
						const votingSet = {
							title: quest.title,
							categoryNm: quest.categoryNm.seasonCategoryName,
							questStatus: quest.questStatus,
							approveTx: quest.approveTx,
							adjournTx: quest.adjournTx,
							successTx: quest.successTx,
							answerList: quest.answers,
							spenderAddress: quest.creatorAddress,
							selectedAnswer: quest.selectedAnswer,

							hot: quest.hot,						
							pending: quest.pending,

							bettingTx: votingData.transactionId,
							answerTitle: votingData.answerNm.title,
							bettingCoin: votingData.bettingCoin,
							multiply: votingData.multiply,
							predictionFee: votingData.predictionFee,
							_id: votingData._id
						}
						
						votingArr.push({ ...votingSet });
						setVotings( {...votings, votingSet: [...votings.votingSet, ...votingArr]} );
					} 
				});
			});
			
			setLoading(false);
		});
	}

	/**
	 * Send CT
	 */
	const sendCTToAddress = async () => {
		try {
			const walletAddress = walletData.account;
			if(sendCTInput.recipientAddress == '' || sendCTInput.amount == 0 ) {
				alert('input recipientAddress or amount');
				return;
			}

			if(!walletAddress || walletAddress === '') {	
				alert('login for send CT');
				return;
			}

			console.log('do transfer', walletData.type);
			let transferRes;
			if(walletData.type === 'kaikas') {
				transferRes = await transferCojamURI({fromAddress: walletAddress, toAddress: sendCTInput.recipientAddress, amount: Number(sendCTInput.amount)});
			} else {
				transferRes = await transferCojamURI_KLIP({fromAddress: walletAddress, toAddress: sendCTInput.recipientAddress, amount: Number(sendCTInput.amount)});
			}
			
			if(transferRes.status === 200) {
				alert(`${sendCTInput.amount} (CT) send to '${sendCTInput.recipientAddress}' successfully.`);
			} else {
				alert('send CT error. try again please.');
			}
		} catch(error) {
			console.log(error);
			//ignore
			alert('transfer api error. try again please.');
			return;
		}
	}

	/**
	 * Login reward
	 */
	const getLoginReward = () => {
		const walletAddress = walletData.account;

		if(walletAddress) {
			// 9 hours after
			const creteriaDate = Moment().add('9', 'h').format("yyyy-MM-DD");
			const loginRewardHistQuery = `*[_type == 'loginRewardHistory' && walletAddress == '${walletAddress}' && loginDate == '${creteriaDate}'][0]`;
			client.fetch(loginRewardHistQuery).then((loginRewardHistory) => {
				// check if user got join reward. before 9 hours.
				if(loginRewardHistory || hadLoginReward) {
					alert("you've got reward already.");
				} else {
					const rewardInfoQuery = `*[_type == 'rewardInfo' && isActive == true && rewardType == 'login'][0]`;
					client.fetch(rewardInfoQuery).then(async (rewardInfo) => {
						if(!rewardInfo.amount) {
							alert('login reward amount is not exist');
							return;
						}

						// send coin from master wallet
						let transferRes;
						const rewardAddress = '0xfA4fF8b168894141c1d6FAf21A58cb3962C93B84'; // KAS reward wallet - no CT
						try {
							transferRes = await getRewardCojamURI({fromAddress: rewardAddress, toAddress: walletAddress, amount: Number(rewardInfo.amount)});
						} catch(error) {
							console.log(error);
							//ignore
							alert('transfer api error. try again.');
							return;
						}

						if(transferRes.status === 200) {
							// remain transfer history
							const loginRewardHistoryDoc = {
								_type: 'loginRewardHistory',
								walletAddress: walletAddress,
								loginDate: creteriaDate,
								rewardAmount: Number(rewardInfo.amount),
								transactionId: transferRes.transactionId,
								createDateTime: Moment().format("yyyy-MM-DD HH:mm:ss")
							}

							client.create(loginRewardHistoryDoc).then((res) => {
								console.log('login reward hist create result', res);
							});

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

							client.create(transactionSet);

							alert('get login reward successfully!');
						} else {
							alert('get login reward failed.');
						}
					});
				}
			});
		} else {
			alert('login first. please');
		}
	}

	/**
	 * Load Voting, Grounds, Transfer infos
	 */
	useEffect(() => {
		const walletAddress = walletData.account;

		setLoading(true);
		loadVotings();
		
		const groundQuery = `*[_type == 'quests' && isActive == true] {..., 'seasonNm': *[_type=='season' && _id == ^.season._ref]{title}[0], 'categoryNm': *[_type=='seasonCategories' && _id == ^.seasonCategory._ref]{seasonCategoryName}[0] }`;
		client.fetch(groundQuery).then((grounds) => {
			setGrounds(grounds);
		});

		const transferQuery = `*[_type == 'transactions' && spenderAddress == '${walletAddress}' || recipientAddress == '${walletAddress}']`;
		client.fetch(transferQuery).then((transfers) => {
			setTransfers(transfers);
		});

		let subscription;
		if(walletAddress) {					   
			const loginRewardHistQuery = `*[_type == 'loginRewardHistory' && walletAddress == '${walletAddress}']`;
			subscription = client.listen(loginRewardHistQuery).subscribe((rewardHistory) => {
				console.log('reward history update !!!', walletAddress);
				
				console.log('transaction rewardHistory', rewardHistory.result);
				if(rewardHistory.result) {
					setHadLoginReward(true);
				} else {
					setHadLoginReward(false);
				}
			});	
		}

		return () => subscription?.unsubscribe();
	}, [walletData]);

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
					<a href="#" className="btn-purple" onClick={() => modalSendCT(true)}>CT Send</a>
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
									<ul key={index} style={{ cursor: 'pointer' }} onClick={() => { setSelectedVoting(voting); modalMypageVoting(true); }} >
										<li key='1'><span>Category : </span>{voting.categoryNm}</li>
										<li key='2'><span>Title : </span>{voting.title}</li>
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
										<li key='4'><span>My Answer : </span> {voting.answerTitle} ({voting.bettingCoin} CT) &nbsp; <div className='mc-votings-result' style={{ background: voting.selectedAnswer ? (voting.selectedAnswer === voting.answerTitle ? '#58D68D' : '#E74C3C') : 'white' }} ></div></li>
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
										<li key='2' style={{ cursor: 'pointer' }} onClick={() => { setSelectedGround(ground); modalMypageGround(true); }}><span>Title : </span> { ground.title } </li>
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
										<li key='5'><span>Total Creator Fee : </span> { ground.totalCreatorFee }  CT ({ ground.creatorFee }%)</li>
										<li key='6'><span>Donation Fee : </span>{ ground.totalCharityFee } CT ({ ground.charityFee } %)</li>
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


			{/* 모달 - SEND CT */}
			<Modal open={openSendCT} onClose={() => modalSendCT(false)} center>
				<div className="modal-send-ct">
					<form name="addForm" method="post" action="">
						<fieldset>
							<legend>SEND CT</legend>
							<div className="msc-area">
								<dl>
									<dt>SEND CT</dt>
									<dd><i className="uil uil-times" onClick={() => modalSendCT(false)}></i></dd>
								</dl>
								<ul> 
									<li key='1'><input name="name" type="text" className="w100p" onChange={(e) => {sendCTInput.recipientAddress = e.target.value}} placeholder="Enter the recipient address" /></li>
									<li key='2'><input name="name" type="text" className="w100p" onChange={(e) => {if(isNaN(e.target.value)) { return; } sendCTInput.amount = Number(e.target.value)}} placeholder="Please enter CT amount" /></li>
								</ul>
								<p>
									<a href="#" onClick={() => sendCTToAddress()}>Send CT</a>
								</p>
							</div>
						</fieldset>
					</form>
				</div>
			</Modal>
			{/* 모달 - SEND CT 끝 */}


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
										<span>Betting Transaction</span>
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
