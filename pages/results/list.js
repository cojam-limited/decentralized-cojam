import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom'

import { urlFor, client } from "../../sanity";

import Moment from 'moment';

import Pagination from "react-sanity-pagination";
import { useLoadingState } from "../../assets/context/LoadingContext";

function Index() {
	const history = useHistory();
	const { setLoading } = useLoadingState();
	const [ bannerImage, setBannerImage ] = useState();
	
	{/* 페이지네이션 세팅 */}
	let postsPerPage = 6;
	const [items, setItems] = useState([]);
	const [itemsToSend, setItemsToSend] = useState([]);

	const action = (page, range, items) => {
		// Update State
		setItems(items);
	};
	{/* 페이지네이션 세팅 끝 */}

	useEffect(() => {
		// banner image 조회
		const imageQuery = `*[_type == 'pageImages' && pageTitle == 'results'][0]`;
		client.fetch(imageQuery).then((image) => {
			if(image) {
				setBannerImage(image.pageImage);
			}
		});

		setLoading(true);
		const query = `*[_type == 'resultList' && isActive == true && _id != '${Date.now()}']`;
		client.fetch(query).then((datas) => {
			datas.forEach((data) => {
				data.postDate = Moment(data.postDate).format('YYYY-MM-DD HH:mm');
			});

			setItemsToSend(datas);
			setItems(datas.slice(0, postsPerPage));
			
			document.querySelectorAll('.pagePagination button').forEach((button) => button.classList.remove("active"));
			document.querySelector('.pagePagination :nth-child(2) > button')?.classList.add("active");

			setLoading(false);
		});
	}, []);
	
	return (
		<div className="bg-notice" style={{background: `${bannerImage && `url(${urlFor(bannerImage)})`} center -590px no-repeat, #fff`}}>
			{/* 타이틀영역 */}
			<div className="title-area">
				Results
			</div>
			{/* 타이틀영역 끝 */}

			<div className="container-top-round">
				{/* post 리스트 */}
				<div className="notice-list mt10">
					<ul className="paginationContent">
						{
							items && items.map((post, index) => (
								<li key={index} onClick={()=>{ history.push({ pathname: '/ResultsView', state: {post: post}}) }}>
									<p>
										<span 
											style={{  
												backgroundImage: post.mainImage && `url('${urlFor(post.mainImage)}')`,
												backgroundPosition: `center`, 
												backgroundSize: `cover`,
												backgroundRepeat: 'no-repeat !important'
											}}
										></span>
									</p>
									<div>
										<dl>
											<dt><i className="uil uil-calendar-alt"></i> {post.postDate}</dt>
												{	post.type && 
													<dd>
														{post.type === 'News' ? <em>{post.type}</em> : <span>{post.type}</span>} 
													</dd>
												}
											{/* em -- News */}
											{/* <dd><em>News</em></dd> */}
										</dl>
										<h2>{post.title}</h2>
									</div>
								</li>
							))
						}
					</ul>
				</div>
				{/* post 리스트 끝 */}


				{/* 페이지네이션 */}
				{
					itemsToSend.length > 0 && 
					<Pagination
						nextButton={true}
						prevButton={true}
						nextButtonLabel={">"}
						prevButtonLabel={"<"}
						items={itemsToSend}
						action={action}
						postsPerPage={postsPerPage}
					/>
				}
				{/* 페이지네이션 끝 */}
			</div>

    </div>
  );
}



export default Index;