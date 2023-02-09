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
	const [ newAccount, setNewAccount ] = useState(window?.klaytn?.selectedAddress?.toLowerCase());

	console.log(newAccount);

	window.klaytn.on('accountsChanged', (accounts) => {
    setNewAccount(accounts[0]);
  });
	
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
		if(newAccount.toLowerCase() === amdinContractAddress.toLowerCase()) {
			history.push('/Dao/DaoList')
			return;
		}

		const balance = await NftContract().methods.balanceOf(newAccount).call();
    if(balance <= 0) {
      toastNotify({
        state: 'error',
        message: 'You Need Membership NFT',
      })
      history.push({pathname: `/`})
      return;
    }

		history.push('/Dao/DaoList')
	}


  return (
		<div
			className="bg-service"
			style={{
				background: `${bannerImage && `url(${urlFor(bannerImage)})`} center -170px no-repeat, #fff`,
				width: '100vw',
				height: '85%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
			}}>			
			<div
				className="title-area"
				style={{
					paddingTop: '0',
				}}
			>
				COJAM GOVERNANCE DAO
			</div>
			<button
				style={{
					backgroundColor: '#fff',
					color: '#000',
					border: 'none',
					borderRadius: '4px',
					width: '140px',
					height: '52px',
					fontSize: '20px'
				}}
				onClick={goToDaoList}
			>GET START</button>
		</div>
  );
}

export default Index;