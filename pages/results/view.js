import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { urlFor, client } from "../../sanity";

import backgroundImage from '@assets/body_notice.jpg';

function Index(props) {
	const [ post, setPost ] = useState(props.location.state.post);
	const [ postView, setPostView ] = useState([]);


	useEffect(() => {
		const query = `*[_type == "postView" && title == "${post.title}"]`;
		client.fetch(query).then((data) => {
			console.log('query data', data);
			
			setPostView(data && data[0]);
			console.log('post view', data[0]);
		});
	}, [post]);

  	return (
		<div className="bg-notice" style={{background: `url('${backgroundImage}') center -590px no-repeat, #fff`}}>
			{/* 타이틀영역 */}
			<div className="title-area">
				Results
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
								<p>{post.mainImage && <img src={urlFor(post.mainImage)} width="100%" alt="" title="" />}</p>
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
						<Link to="/ResultsList" className="btn-purple">List</Link>
					</div>
				</div>
				{/* 상세 끝 */}

			</div>
    </div>
  );
}

export default Index;