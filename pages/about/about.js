import React, { useRef, useState, useEffect } from 'react';

import aboutContatIcn01 from '@assets/about_contat_icn01.png'
import aboutContatIcn04 from '@assets/about_contat_icn04.png'
import snsIconNaver from '@assets/sns_icon_naver.png'
import snsIconMedium from '@assets/sns_icon_medium.png'
import snsIconInstagram from '@assets/sns_icon_instagram.png'
import snsIconTwiter from '@assets/sns_icon_twiter.png'
import snsIconFacebook from '@assets/sns_icon_facebook.png'
import snsIconKakao from '@assets/sns_icon_kakao.png'

import aboutMovie from '@assets/about_movie.mp4'

import appStoreImage from '@assets/app_store.jpg';
import googleStoreImage from '@assets/google_store.jpg';
import gitBookImage from '@assets/git_book.jpg';

import { urlFor, client } from "../../sanity";

function Index() {
	const topRef = useRef(null);
	const [ bannerImage, setBannerImage ] = useState();
	
	// 첫 렌더링 시, 맨 위로 이동
	useEffect(() => {
		const element = topRef.current;
		const scrollableContainer = document.body;

		scrollableContainer.scrollTop = element.offsetTop;
	}, []);

	useEffect(() => {
		// banner image 조회
		const imageQuery = `*[_type == 'pageImages' && pageTitle == 'about'][0]`;
		client.fetch(imageQuery).then((image) => {
			if(image) {
				setBannerImage(image.pageImage);
			}
		});
	}, []);


  return (
	<div className="bg-about" style={{background: `${bannerImage && `url(${urlFor(bannerImage)})`} center -590px no-repeat, #fff`}}>
		<div ref={topRef} />

		{/* 타이틀영역 */}
		<div className="title-area">
			About the Company
		</div>
		{/* 타이틀영역 끝 */}

		<div className="container-top-round">
			<div className="about-cojam">
				<h2>Introduce COJAM</h2>

				<video width="100%" autoPlay muted controls playsInline>
					<source src={aboutMovie} type="video/mp4" />
					Your browser does not support HTML5 video.
				</video>
			</div>

			<div className="about-history">
				<h2>GET COJAM</h2>
				<p>Click on the image to learn more about COJAM!<br /></p>
				<div style={{ justifyContent: 'center', display: 'flex', padding: 15 }}>
					<a className="about-appstore" href="#" style={{background: `url('${appStoreImage}') no-repeat`, backgroundSize: 'contain', padding: 0, textAlign: 'center'}}></a>
					<a className="about-googlestore" href="#" style={{background: `url('${googleStoreImage}') no-repeat`, backgroundSize: 'contain', padding: 0, textAlign: 'center'}}></a>
				</div>
			</div>

			<div className="about-contact">
				<h2>COJAM'S GITBOOK</h2>
				<p>Click on the image to learn more about COJAM!</p>
				<div className="about-contact-content" style={{ justifyContent: 'center', display: 'flex', padding: 15 }}>
					<div className="about-gitbook" href="#" style={{background: `url('${gitBookImage}') no-repeat`, backgroundSize: 'contain' }}></div>
				</div>
			</div>
		</div>

		<div>
			<div className="about-contact-content">
				<div>
					<ul>
						<li key="1">
							<a target="_blank" href="https://www.google.com/maps/place/The+Tara+Building+-+Coworking+%26+Office+Spaces+Dublin+2/@53.3469828,-6.2574787,17z/data=!3m1!4b1!4m5!3m4!1s0x48670e85677f5bbd:0x52de8be53512895!8m2!3d53.3469828!4d-6.25529" rel="noreferrer"><img src={aboutContatIcn01} alt="" title="" />	Hanover House, 85-89 South Main Street, Cork, Ireland,+353 85 876 2991</a>
						</li>
						<li key="2">
							<a target="_blank" href="https://t.me/cojamkorea" rel="noreferrer"><img src={aboutContatIcn04} alt="" title="" />Telegram @cojamkorea</a>
						</li>
						<li key="3">
							<a target="_blank" href="mailto: ask@cojam.io" rel="noreferrer"><img src={aboutContatIcn04} alt="" title="" />ask@cojam.io</a>
						</li>
					</ul>
				</div>
				<div>
					<ul>
						<li key="1">
							<a target="_blank" href="https://blog.naver.com/cojam_limited" rel="noreferrer"><img src={snsIconNaver} alt="" title="" />Telegram</a>
						</li>
						<li  key="2">
							<a target="_blank" href="https://cojam-official.medium.com/" rel="noreferrer"><img src={snsIconMedium} alt="" title="" />Medium</a>
						</li>
						<li  key="3">
							<a target="_blank" href="https://www.instagram.com/cojam_official/" rel="noreferrer"><img src={snsIconInstagram} alt="" title="" />Instagram</a>
						</li>
					</ul>
				</div>
				<div>
					<ul>
						<li  key="1">
							<a target="_blank" href="https://twitter.com/OfficialCojam" rel="noreferrer"><img src={snsIconTwiter} alt="" title="" />Twitter</a>
						</li>
						<li  key="2">
							<a target="_blank" href="https://www.facebook.com/cojam.limited/" rel="noreferrer"><img src={snsIconFacebook} alt="" title="" />Facebook</a>
						</li>
						<li  key="3">
							<a target="_blank" href="https://open.kakao.com/o/gVOJyBad" rel="noreferrer"><img src={snsIconKakao} alt="" title="" />Discord</a>
						</li>
					</ul>
				</div>
				<div>
					<ul>
						<li  key="1">
							<a target="_blank" href="https://twitter.com/OfficialCojam" rel="noreferrer"><img src={snsIconTwiter} alt="" title="" />App store</a>
						</li>
						<li  key="2">
							<a target="_blank" href="https://www.facebook.com/cojam.limited/" rel="noreferrer"><img src={snsIconFacebook} alt="" title="" />Google store</a>
						</li>
					</ul>
				</div>
			</div>
		</div>
    </div>
  );
}



export default Index;