import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'

import { urlFor, client } from "../../sanity";

import { useLoadingState } from "../../assets/context/LoadingContext";
import { NftContract } from "../dao/contractHelper";

import toastNotify from '@utils/toast';

function Index() {
	const history = useHistory();
	const { setLoading } = useLoadingState();
	const [ bannerImage, setBannerImage ] = useState();
	const amdinContractAddress = '0x867385AcD7171A18CBd6CB1ddc4dc1c80ba5fD52';
	
	useEffect(() => {
		setLoading(true);
		// banner image 조회
		const imageQuery = `*[_type == 'pageImages' && pageTitle == 'about'][0]`;
		client.fetch(imageQuery).then((image) => {
			if(image) {
				setBannerImage(image.pageImage);
			}
			setLoading(false);
		});
	}, []);

	const goToDaoList = async () => {
		const accounts = await window.klaytn.enable();
		const account = accounts[0];
		
		if(account.toLowerCase() === amdinContractAddress.toLowerCase()) {
			history.push('/Dao/DaoList')
			return;
		}

		const balance = await NftContract().methods.balanceOf(account).call();
    if(Number(balance) <= 0) {
      toastNotify({
        state: 'error',
        message: 'You Need Membership NFT',
      })
      history.push('/');
      return;
    }

		history.push('/Dao/DaoList')
	}

  return (
		<div>
			<div
				className="dao-bg-service"
				style={{
					background: `${bannerImage && `url(${urlFor(bannerImage)})`} center -170px no-repeat, #fff`
				}}>			
				<div className="dao-title-area">
					COJAM GOVERNANCE DAO
				</div>
				<button onClick={goToDaoList}>GET START</button>
			</div>
		</div>
  );
}

export default Index;