//import { Link } from 'react-router-dom'
import React, { useState, useEffect } from 'react';
import { Modal } from 'react-responsive-modal';

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import { client, urlFor } from "../../sanity";
import 'react-responsive-modal/styles.css';
import backgroundImage from '@assets/body_mypage.jpg';
import { useWalletData } from '@data/wallet';
import { useLoadingState } from "@assets/context/LoadingContext";

import Moment from 'moment';

function Index() {
	const [ openDetail, modalDetail ] = useState(false);
	const [ address, setAddress ] = useState();
	
	const [ categories, setCategories ] = useState([]);
	const [ activeCategory, setActiveCategory ] = useState('ONGOING');
	const [ activeDetailData, setActiveDetailData ] = useState({});
	const [ selectedQuest, setSelectedQuest ] = useState([]);

	const [ openSuccess, modalSuccess ] = useState(false);
	const [ selectedAnswer, setSelectedAnswer ] = useState({});

	return (
		<div className="bg-mypage" style={{background: `url('${backgroundImage}') center -590px no-repeat, #eef0f8 `}}>

				{/* 타이틀영역 */}
				<div className="title-area">
					Account Management
				</div>
				{/* 타이틀영역 끝 */}

				{/* 마켓 - 내용 */}
				<div className="market-content">
					<div className="mc-markets" style={{ display: 'block' }}>
						<div>
							<ul>
								<span>Account : </span> 
								<li key='1'> <input type='text' onChange={(e) => { setAddress(e.target.value) }}/></li>
								<li key='2'> <input type='text' onChange={(e) => { e.target.value }}/></li>
								<li><a href="#" onClick={() => modalDetail(false)}>Confirm</a></li>
							</ul>
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
													<input name="name" type="text" className="w100p" placeholder="" disabled/>
												</li>
												<li>
													<span>Title(Korean)</span>
													<input name="name" type="text" className="w100p" placeholder="" disabled defaultValue={activeDetailData.title}/>
												</li>
												<li>
													<span>Title(Chinese)</span>
													<input name="name" type="text" className="w100p" placeholder="" disabled/>
												</li>
												<li>
													<span>Category</span>
													<input name="name" type="text" className="w100p" placeholder="" disabled defaultValue={activeDetailData.categoryName}/>
												</li>
												<li>
													<span>Status</span>
													<input name="name" type="text" className="w100p" placeholder="" disabled defaultValue={activeDetailData.status}/>
												</li>
												<li>
													<span>Description</span>
													<input name="name" type="text" className="w100p" placeholder="" disabled defaultValue={activeDetailData.description}/>
												</li>
												<li>
													<span>Draft Transaction</span>
													<input name="name" type="text" className="w100p" placeholder="" disabled defaultValue={activeDetailData.draftTx}/>
												</li>
												<li>
													<span>Answers Transaction</span>
													<input name="name" type="text" className="w100p" placeholder="" disabled defaultValue={activeDetailData.answerTx}/>
												</li>
												<li>
													<span>Apporve Transaction</span>
													<input name="name" type="text" className="w100p" placeholder="" disabled defaultValue={activeDetailData.approveTx}/>
												</li>
												<li>
													<span>Adjourn Transaction</span>
													<input name="name" type="text" className="w100p" placeholder="" disabled defaultValue={activeDetailData.adjournTx}/>
												</li>
												<li>
													<span>Success Transaction</span>
													<input name="name" type="text" className="w100p" placeholder="" disabled defaultValue={activeDetailData.successTx}/>
												</li>
												<li>
													<span>Answer List</span>
													{
														activeDetailData?.answers?.map((answer, index) => (
															<input name="name" type="text" key={index} className="w100p" placeholder="" disabled defaultValue={answer.title}/>
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
										<dd><i className="uil uil-times" onClick={() => modalSuccess(false)}></i></dd>
									</dl>
									<ul>
										{
											activeDetailData &&
											<>
												<li>
													<span>Answer List</span>
													{
														activeDetailData?.answers?.map((answer, index) => (
															<input key={index} name="name" type="text" className="w100p" placeholder="" style={{ cursor: 'pointer', background: answer.title === selectedAnswer.title ? '#8950fc' : '' }} onClick={() => {setSelectedAnswer(answer)}} readonly defaultValue={answer.title}/>
														))
													}	
												</li>
											</>
										}
									</ul>
									<p>
										<a href="#" onClick={() => { modalSuccess(false) }}>Confirm</a>
									</p>
								</div>
							</fieldset>
						</form>
					</div>
				</Modal>
				{/* 모달 - SUCCESS 끝 */}

				<div className="h70"></div>
		</div>
	);
}

export default Index;
