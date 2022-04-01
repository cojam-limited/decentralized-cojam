import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { urlFor, client } from "../../sanity";

//import ClipLoader from "react-spinners/ClipLoader";
import { Oval } from 'react-loader-spinner';

import { css } from "@emotion/react";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;
import { useLoadingState } from "../../assets/context/LoadingContext";
import backgroundImage from '@assets/body_service.jpg';

function Index(props) {
	const { setLoading } = useLoadingState();
	const [post, setPost] = useState(props.location.state.post);
	const [postView, setPostView] = useState([]);

	useEffect(() => {
		setLoading(true);
		const query = `*[_type == "communityView" && title == "${post.title}"]`;
		client.fetch(query).then((data) => {
			setPostView(data && data[0]);
			setLoading(false);
		});
	}, [post]);

  return (
	<div className="bg-service" style={{background: `url('${backgroundImage}') center -590px no-repeat, #fff`}}>

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
						<h2><span>[{post.type}]</span> {post.title}</h2>
						<h3><i className="uil uil-calendar-alt"></i> {post.postDate}</h3>
						<div>
							<p>{post && post.mainImage && <img src={urlFor(post.mainImage)} width="100%" alt="" title="" />}</p>
							<br /><br />
							<div>
								{postView && postView.description}
							</div>
						</div>
					</dt>
					<dd>
						<h2>Related</h2>
						<ul>
							{
								postView && postView.related && postView.related.map((relatedPost, index) => (
									<li key={index} onClick={() => setPost(relatedPost)}>
										<p>
											<span 
											style={{ 
												backgroundImage: relatedPost.mainImage && `url('${urlFor(relatedPost.mainImage)}')`,
												backgroundPosition: `center`, 
												backgroundSize: `cover` 
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