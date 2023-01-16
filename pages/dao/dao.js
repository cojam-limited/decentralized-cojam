import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom'

import { urlFor, client } from "../../sanity";

import Moment from 'moment';

import Pagination from "react-sanity-pagination";
import { useLoadingState } from "../../assets/context/LoadingContext";

function Index() {
	const history = useHistory();
	const { setLoading } = useLoadingState();
	const [categories, setCategories] = useState(['All', 'News', 'Notice']);
	const [activeCategory, setActiveCategory] = useState('All');
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
		const imageQuery = `*[_type == 'pageImages' && pageTitle == 'community'][0]`;
		client.fetch(imageQuery).then((image) => {
			if(image) {
				setBannerImage(image.pageImage);
			}
		});
	}, []);
	
	useEffect(() => {
		setLoading(true);
		// community list 조회
		const query = `*[_type == 'communityList' && isActive == true && _id != '${Date.now()}' ${activeCategory == 'All' ? '' : `&& type == '${activeCategory}'`}]`;
		client.fetch(query).then((datas) => {
			datas.forEach((data) => {
				data.postDate = Moment(data.postDate).format('YYYY-MM-DD HH:mm');
			});

			setItemsToSend(datas);
			setItems(datas.slice(0, postsPerPage));
			
			document.querySelectorAll('.pagePagination button').forEach((button) => button?.classList.remove("active"));
			document.querySelector('.pagePagination :nth-child(2) > button')?.classList.add("active");
			setLoading(false);
		});
	}, [activeCategory]);

	const goToDaoList = () => {
		history.push('/Dao/DaoList')
	}


  return (
		<div className="bg-service" style={{background: `${bannerImage && `url(${urlFor(bannerImage)})`} center -590px no-repeat, #fff`}}>
				{/* 타이틀영역 */}
				<div className="title-area" onClick={goToDaoList}>
					DAO LIST
				</div>
				{/* 타이틀영역 끝 */}
			</div>
  );
}



export default Index;