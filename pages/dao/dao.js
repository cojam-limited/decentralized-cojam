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
	
	useEffect(() => {
		setLoading(true);
		setLoading(false);
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