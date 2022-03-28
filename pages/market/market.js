//import { Link } from 'react-router-dom'
import React, { useState, useEffect } from 'react';
import { Modal } from 'react-responsive-modal';

import { client } from "../../sanity";
import 'react-responsive-modal/styles.css';
import backgroundImage from '@assets/body_mypage.jpg';
import { useWalletData } from '@data/wallet';

function Index() {
	const [openSendCT, modalSendCT] = useState(false);
	const [openAdjourn, modalAdjourn] = useState(false);
	const { walletData } = useWalletData();
	const [ transactionDatas, setTransactionDatas ] = useState([]);

	useEffect(() => {
		const walletAddress = walletData.account;
		console.log('adjourn walletAddress', walletAddress);

		if(walletAddress) {
			const selectedTransactions = [];
			const transactionQuery = `*[_type == 'transactions' && recipientAddress == '${walletAddress}']`;
			client.fetch(transactionQuery).then((transactions) => {
				transactions.forEach((transaction) => {
					console.log('transaction id', transaction.transactionId);

					const bettingQuery = `*[_type == 'betting' && transactionId == '${transaction.transactionId}'][0]`;
					client.fetch(bettingQuery).then((betting) => {
						if(betting) {
							console.log('transaction betting', betting, betting.questKey);

							const questQuery = `*[_type == 'quests' && questKey == ${betting.questKey}][0] { ..., 'categoryNm': *[_type=='seasonCategories' && _id == ^.seasonCategory._ref]{seasonCategoryName}[0] }`;
							client.fetch(questQuery).then((quest) => {
								if(quest) {
									console.log('transaction quest', quest.title, quest.categoryNm.seasonCategoryName, quest.answers, quest.endDateTime, quest.totalAmount);

									const transactionSet = {
										categoryNm: quest.categoryNm.seasonCategoryName,
										title: quest.title,
										endDateTime: quest.endDateTime,
										total: quest.totalAmount
									}

									transactionDatas.push(transactionSet);
									setTransactionDatas( transactionDatas );
								} 
							});
						}
					});
				});
			});
		}
		
	}, [walletData]);

	console.log('transactionDatas', transactionDatas);

	return (
		<div className="bg-mypage" style={{background: `url('${backgroundImage}') center -590px no-repeat, #eef0f8 `}}>

				{/* 타이틀영역 */}
				<div className="title-area">
					Adjourn
				</div>
				{/* 타이틀영역 끝 */}


				{/* 마이페이지 - 기본정보 */}
				<div className="mypage-info">
					<dd>
						<a href="#" className="btn-red">Click to be Reward!</a>
						<a href="#" className="btn-purple" onClick={() => modalSendCT(true)}>CT Send</a>
						<a href="#" className="btn-blue">Click to be Reward!</a>
					</dd>
				</div>
				{/* 마이페이지 - 기본정보 끝 */}

				{/* 마이페이지 - 내용 */}
				<div className="market-content">
					<div className="mc-markets" style={{ display: 'block', cursor: 'pointer' }}>
						<div>
							<ul>
								<li key='1'><strong>Check</strong></li>
								<li key='2'><strong>No.</strong></li>
								<li key='3'><strong>Category</strong></li>
								<li key='4'><strong>Title</strong></li>
								<li key='5'><strong>End Date</strong></li>
								<li key='6'><strong>Total(minimum)</strong></li>
								<li key='7'><strong>Pend </strong></li>
								<li key='8'><strong>Hot </strong></li>
							</ul>

							{	
								transactionDatas.map((transactionData, index) => (
									<ul onClick={() => modalAdjourn(true)}>
										<li key='1'><span>Check : </span> <input type="checkbox" name="xxx" value="yyy" class="check"/></li>
										<li key='2'><span>No. : </span> {index} </li>
										<li key='3'><span>Category : </span> {transactionData.categoryNm} </li>
										<li key='4'><span>Title : </span> {transactionData.title} </li>
										<li key='5'><span>End Date : </span> {transactionData.endDateTime} </li>
										<li key='6'><span>Total(minimum) : </span> {transactionData.totalAmount}(5000)</li>
										<li key='7'><span>Pend : </span><p class="false">F</p></li>
										<li key='8'><span>Hot : </span><p class="true">T</p></li>
									</ul>
								))
							}
						</div>
					</div>
				</div>
				{/* 마이페이지 - 내용 끝 */}

				{/* 모달 - Adjourn 상세 */}
				<Modal open={openAdjourn} onClose={() => modalAdjourn(false)} center>
					<div className="modal-mypage-view">
						<form name="addForm" method="post" action="">
							<fieldset>
								<legend>AdJourn Detail</legend>
								<div className="mmv-area">
									<dl>
										<dt>AdJourn Detail</dt>
										<dd><i className="uil uil-times" onClick={() => modalAdjourn(false)}></i></dd>
									</dl>
									<ul>
										<li>
											<span>Draft Transaction</span>
											<input name="name" type="text" className="w100p" placeholder="" />
										</li>
										<li>
											<span>Answers Transaction</span>
											<input name="name" type="text" className="w100p" placeholder="" />
										</li>
										<li>
											<span>Apporve Transaction</span>
											<input name="name" type="text" className="w100p" placeholder="" />
										</li>
										<li>
											<span>Adjourn Transaction</span>
											<input name="name" type="text" className="w100p" placeholder="" />
										</li>
										<li>
											<span>Success Transaction</span>
											<input name="name" type="text" className="w100p" placeholder="" />
										</li>
										<li>
											<span>Answer List</span>
											<input name="name" type="text" className="w100p" placeholder="" />
										</li>
										<li>
											<span>Season</span>
											<input name="name" type="text" className="w100p" placeholder="" />
										</li>
									</ul>
									<p>
										<a href="#">Confirm</a>
									</p>
								</div>
							</fieldset>
						</form>
					</div>
				</Modal>
				{/* 모달 -  Adjourn 상세 끝 */}

				<div className="h70"></div>
		</div>
	);
}

export default Index;
