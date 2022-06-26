//import { Link } from 'react-router-dom'
import React from 'react';

import serviceIcn04 from '@assets/service_icn04.png'
import serviceIcn06 from '@assets/service_icn06.png'
import serviceIcn08 from '@assets/service_icn08.png'
import serviceIcn09 from '@assets/service_icn09.png'
import serviceIcn10 from '@assets/service_icn10.png'
import serviceIcn11 from '@assets/service_icn11.png'
import aboutContatIcn01 from '@assets/about_contat_icn01.png'
import aboutContatIcn04 from '@assets/about_contat_icn04.png'
import snsIconNaver from '@assets/sns_icon_naver.png'
import snsIconMedium from '@assets/sns_icon_medium.png'
import snsIconInstagram from '@assets/sns_icon_instagram.png'
import snsIconTwiter from '@assets/sns_icon_twiter.png'
import snsIconFacebook from '@assets/sns_icon_facebook.png'
import snsIconKakao from '@assets/sns_icon_kakao.png'

import aboutMovie from '@assets/about_movie.mp4'

import backgroundImage from '@assets/body_about.jpg';
import historyBackgroundImage from '@assets/about_history_img01.svg';

function Index() {
  return (
	<div className="bg-about" style={{background: `url('${backgroundImage}') center -590px no-repeat, #fff`}}>
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
			<h3>What is Cojam</h3>
			<p>Can you predict? <br />This is a reward-type prediction platform where users who produce content and those who participate solve the answers, compete, and receive compensation based on the results.</p>
			<p>Start Prediction with COJAM!</p>
		</div>
		<div className="service-content1">
			<h2>Whitepapers</h2>
			<p>Click your country to download the white paper for each country.</p>
			<ul className="sc1-top">
				<li key="1">
					<p><img src={serviceIcn04} alt="" title="" /></p>
					<h3>COJAM<br />WHITEPAPERS</h3>
					<a href="../../assets/pdf/COJAM WP_v2.0.pdf" target="_blank"><img src={serviceIcn09} alt="" title="" /> KOR DOWNLOAD <i className="uil uil-import"></i></a>
				</li>
				<li key="2">
					<p><img src={serviceIcn04} alt="" title="" /></p>
					<h3>COJAM<br />WHITEPAPERS</h3>
					<a href="../../assets/pdf/COJAM WP_v2.0_EN.pdf" target="_blank"><img src={serviceIcn06} alt="" title="" />	ENG DOWNLOAD <i className="uil uil-import"></i></a>
				</li>
				<li key="3">
					<p><img src={serviceIcn04} alt="" title="" /></p>
					<h3>COJAM<br />WHITEPAPERS</h3>
					<a href="../../assets/pdf/COJAM WP_v2.0_TH.pdf" target="_blank"><img src={serviceIcn11} alt="" title="" /> THAI DOWNLOAD <i className="uil uil-import"></i></a>
				</li>
			</ul>
			<ul className="sc1-bottom">
				<li key="1">
					<p><img src={serviceIcn04} alt="" title="" /></p>
					<h3>COJAM<br />WHITEPAPERS</h3>
					<a href="../../assets/pdf/COJAM WP_v2.0_CN.pdf" target="_blank"><img src={serviceIcn08} alt="" title="" /> CHN DOWNLOAD <i className="uil uil-import"></i></a>
				</li>
				<li key="2">
					<p><img src={serviceIcn04} alt="" title="" /></p>
					<h3>COJAM<br />WHITEPAPERS</h3>
					<a href="../../assets/pdf/COJAM WP_v2.0_JP.pdf" target="_blank"><img src={serviceIcn10} alt="" title="" /> JPN DOWNLOAD <i className="uil uil-import"></i></a>
				</li>
			</ul>
		</div>
		
		<div className="about-history">
			<h2>Road Map</h2>
			<p>In everyday life, we always predict something.<br /></p>
			<div style={{background: `url('${historyBackgroundImage}') no-repeat`}}></div>
		</div>
	</div>

		<div className="about-contact">
			<h2>Contact Us</h2>
			<p>We'd love to hear from you<br />we like to create contents with fun, open-minded people.<br />Feel free to say hello!</p>
			<div className="about-contact-content">
				<div>
					<ul>
						<li key="1">
							<a target="_blank" href="https://www.google.com/maps/place/The+Tara+Building+-+Coworking+%26+Office+Spaces+Dublin+2/@53.3469828,-6.2574787,17z/data=!3m1!4b1!4m5!3m4!1s0x48670e85677f5bbd:0x52de8be53512895!8m2!3d53.3469828!4d-6.25529" rel="noreferrer"><img src={aboutContatIcn01} alt="" title="" />	The Tara Building, Tara Street, Dublin 2</a>
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
							<a target="_blank" href="https://blog.naver.com/cojam_limited" rel="noreferrer"><img src={snsIconNaver} alt="" title="" />Naver Blog</a>
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
							<a target="_blank" href="https://open.kakao.com/o/gVOJyBad" rel="noreferrer"><img src={snsIconKakao} alt="" title="" />KaKao</a>
						</li>
					</ul>
				</div>
			</div>
		</div>
    </div>
  );
}



export default Index;