import React, { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { urlFor, client } from "../../sanity";

import { useLoadingState } from "../../assets/context/LoadingContext";
import backgroundImage from '@assets/body_service.jpg';

function Index(props) {
	const { setLoading } = useLoadingState();
	const [ post, setPost ] = useState(props.location.state.post);
	const [ relatedPosts, setRelatedPosts ] = useState([]);
	const topRef = useRef(null);
	
	// 첫 렌더링 시, 맨 위로 이동
	useEffect(() => {
		const element = topRef.current;
		const scrollableContainer = document.body;

		scrollableContainer.scrollTop = element.offsetTop;
	}, []);

	useEffect(async () => {
		setLoading(true);

		const newRelatedPost = [];
		post?.related?.forEach((related) => {
			const query = `*[_type == 'communityList' && isActive == true && _id == '${related._ref}' && _id != '${Date.now()}'][0]`;
			client.fetch(query).then((res) => {
				newRelatedPost.push(res);
				setRelatedPosts([...newRelatedPost]);
			});
		})
			
		if(!post?.related) {
			setRelatedPosts([]);
		}
		
		setLoading(false);
	}, [post]);

  return (
	<div className="bg-service" style={{background: `url('${backgroundImage}') center -590px no-repeat, #fff`}}>
		<div ref={topRef} />

		{/* 타이틀영역 */}
		<div className="title-area">
			Community
		</div>
		{/* 타이틀영역 끝 */}

		<div className="container-top-round">
			{/* 상세 */}
			<div className="notice-view">
				<dl>
					<dt>
						<h2><span>[{post?.type}]</span> {post?.title}</h2>
						<h3><i className="uil uil-calendar-alt"></i> {post?.postDate}</h3>
						<div>
							<p>{post?.mainImage && <img src={urlFor(post?.mainImage)} width="100%" alt="" title="" />}</p>
							<br /><br />
							<div>
								{post?.description}
							</div>
						</div>
					</dt>
					<dd>
						<h2>Related</h2>
						<ul>
							{
								relatedPosts.map((relatedPost, index) => (
									<li key={index} onClick={() => setPost(relatedPost)}>
										<p>
											<span 
											style={{ 
												backgroundImage: relatedPost.mainImage && `url('${urlFor(relatedPost.mainImage)}')`,
												backgroundPosition: `center`, 
												backgroundSize: `cover`,
												backgroundRepeat: 'no-repeat !important'
											}}>
											</span>
										</p>
										<h2>{relatedPost.title}</h2>
									</li>
								))
							}
						</ul>
					</dd>
				</dl>
				<div>
					<Link to="/CommunityList" className="btn-purple">List</Link>
				</div>
			</div>
			{/* 상세 끝 */}
					
		</div>
    </div>
  );
}



export default Index;