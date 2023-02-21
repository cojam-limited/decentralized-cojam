import { client } from "../../sanity";
//import { draftMarket, addAnswerKeys, approveMarket, adjournMarket, retrieveMarket, successMarket, finishMarket } from "@api/UseKaikas";
import { checkLogin, callDraftMarket, callAddAnswerKeys, callApproveMarket, callAdjournMarket, callRetrieveMarket, callSuccessMarket, callFinishMarket } from "@api/UseTransactions";
import Moment from 'moment';
import toastNotify from '@utils/toast';
import { GovernanceContract } from "../dao/contractHelper";

const cojamMarketAddress = '0x6b24afa82775414a8c3778aa8d480587021ba6c8';  // KAS address

export const changeStateFunction = async ({state, walletData, selectedQuest, selectedAnswer, description, setQr, setQrModal, setMinutes, setSeconds, setReloadData, reloadData, finishSelect, setFinishSelect}) => {
    if(!window.confirm('change ground status to [ ' + state + ' ] ?')) {
        return;
    }

    let isLogin = false;
    await checkLogin(walletData).then((res) => {
        isLogin = res;
    });

    if(!isLogin) {
        toastNotify({
            state: 'error',
            message: 're login or check lock. please',
        });
        return;
    }

    try {
        switch(state) {
            case 'pend' :
                await client.patch(selectedQuest._id)
                    .set({ pending: true })
                    .commit();

                toastNotify({
                    state: 'success',
                    message: 'pend success',
                });		
                break;

            case 'unpend' :
                await client.patch(selectedQuest._id)
                    .set({ pending: false })
                    .commit();

                toastNotify({
                    state: 'success',
                    message: 'unpend success',
                });							  
                break;

            case 'invalid': 
                await client.patch(selectedQuest._id)
                    .set({
                        questStatus: 'INVALID', 
                        description: description,
                        updateMember: walletData.account
                    })
                    .commit();

                toastNotify({
                    state: 'success',
                    message: 'invalid success',
                });							  
            
                break;
                
            case 'draft':
                const seasonQuery = `*[_type == 'season' && isActive == true && _id == '${selectedQuest.season._ref}'][0]`;
                await client.fetch(seasonQuery).then(async (season) => {
                    if(season) {
                        if(!selectedQuest.draftTx) {
                            const questKey = selectedQuest.questKey;
                            const creatorPay = Number(season.creatorPay) / 10 ** 18;

                            await callDraftMarket(
                                {
                                    marketKey: questKey, 
                                    creator: season.creatorAddress, 
                                    title: season.title, 
                                    creatorFee: creatorPay, 
                                    creatorFeePercentage: season.creatorFee, 
                                    cojamFeePercentage: season.cojamFee, 
                                    charityFeePercentage: season.charityFee,
                                }, 
                                walletData,
                                setQr, setQrModal, setMinutes, setSeconds
                            ).then(async (res) => {
                                if(res.status === 200) {
                                    await client.patch(selectedQuest._id)
                                        .set({
                                            statusType: 'DRAFT', 
                                            draftTx: res.transactionId,
                                            draftDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                                            updateMember: walletData.account
                                        })
                                        .commit();

                                    toastNotify({
                                        state: 'success',
                                        message: 'draft success',
                                    });		
                                } else {
                                    toastNotify({
                                        state: 'success',
                                        message: 'draft failed',
                                    });		
                                }
                            });
                        } else {
                            toastNotify({
                                state: 'success',
                                message: 'Draft is already Registerd!',
                            });		
                        }
                    }
                });

                break;

            case 'answer':
                if(!selectedQuest.isActive) {
                    toastNotify({
                        state: 'error',
                        message: "Quest is inactive.",
                    });
                    return;
                }

                if(!selectedQuest.draftTx) {
                    toastNotify({
                        state: 'error',
                        message: "Quest is not drafted.",
                    });
                    return;
                }

                if(selectedQuest.answerTx) {
                    toastNotify({
                        state: 'error',
                        message: "Answers is already Registerd!",
                    });
                    return;
                }

                const bettingKeyQuery = `*[_type == 'questAnswerList' && questKey == ${selectedQuest.questKey} && _id != '${Date.now()}' ]`;
                const bettingKeyList = [];
                await client.fetch(bettingKeyQuery).then((bettings) => {
                    bettings.forEach((betting) => {
                        bettingKeyList.push(betting.questAnswerKey);
                    });
                });

                const maxCount = 15;
                let addAnswerRes;
                if( bettingKeyList.length > maxCount ) {
                    const maxIndex = Math.ceil(bettingKeyList.length / maxCount);

                    for(let i = 0; i < maxIndex; i++) {
                        const bettingKeyListCopy = bettingKeyList.slice();
                        if (i > maxIndex - 1) {
                            for (let a = 0; a < maxCount; a++) {
                                bettingKeyListCopy.push(bettingKeyList[(i * maxCount) + a]);
                            }
                        } else {
                            for (let a = 0; a < bigIntegerList.length % maxCount; a++) {
                                bettingKeyListCopy.push(bettingKeyList[(i * maxCount) + a]);
                            }
                        }

                        addAnswerRes = await callAddAnswerKeys({marketKey: selectedQuest.questKey, answerKeys: bettingKeyListCopy}, walletData, setQr, setQrModal, setMinutes, setSeconds);
                    }
                } else {
                    addAnswerRes = await callAddAnswerKeys({marketKey: selectedQuest.questKey, answerKeys: bettingKeyList}, walletData, setQr, setQrModal, setMinutes, setSeconds);
                }

                if(addAnswerRes.status === 200) {
                    await client.patch(selectedQuest._id)
                        .set({
                            statusType: 'ANSWER', 
                            answerTx: addAnswerRes.transactionId,
                            answerDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                            updateMember: walletData.account
                            })  
                        .commit();

                    toastNotify({
                        state: 'success',
                        message: 'Add answer key success',
                    });
                } else {
                    toastNotify({
                        state: 'error',
                        message: "Add answer key failed",
                    });
                    return;
                }

                break;
            
            case 'approve':
                if(!selectedQuest.isActive) {
                    toastNotify({
                        state: 'error',
                        message: "Don't active Season.",
                    });
                    return;
                }

                if(!selectedQuest.answerTx) {
                    toastNotify({
                        state: 'error',
                        message: "Answers is not Confirmed!",
                    });
                    return;
                }

                if(selectedQuest.approveTx) {
                    toastNotify({
                        state: 'error',
                        message: "Approve is already Registerd!",
                    });
                    return;
                }

                const approveMarketRes = await callApproveMarket(selectedQuest.questKey, walletData, setQr, setQrModal, setMinutes, setSeconds);

                if(approveMarketRes.status === 200) {
                    await client.patch(selectedQuest._id)
                        .set({
                                statusType: 'APPROVE', 
                                questStatus: 'APPROVE',
                                approveTx: approveMarketRes.transactionId,
                                approveDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                                updateMember: walletData.account
                            })
                        .commit();
                    
                    toastNotify({
                        state: 'success',
                        message: 'approve market success',
                    });
                } else {
                    toastNotify({
                        state: 'error',
                        message: 'approve market failed',
                    });
                }
                break;

            case 'hot':
                await client.patch(selectedQuest._id)
                    .set({hot: !selectedQuest.hot})
                    .commit();

                toastNotify({
                    state: 'success',
                    message: `hot ${!selectedQuest.hot ? 'set' : 'unset' } success`,
                });	
                break;
            
            case 'finish':
                console.log(finishSelect);
                
                if(selectedQuest.completed && selectedQuest.governanceItem[0].successStartTime) {
                    toastNotify({
                        state: 'error',
                        message: "Already Finished!",
                    });
                    return;
                }

                if(selectedQuest.questStatus !== 'APPROVE') {
                    toastNotify({
                        state: 'error',
                        message: "Market is not approved.",
                    });
                    return;
                }

                if(selectedQuest.pending) {
                    toastNotify({
                        state: 'error',
                        message: "Market is pended.",
                    });
                    return;
                }

                if(!finishSelect.finishTx) {
                    if(window.confirm('Are you sure you want to [Finish] this quest? (1/2)')) {
                        // eslint-disable-next-line no-case-declarations
                        const finishRes = await callFinishMarket(selectedQuest.questKey, walletData, setQr, setQrModal, setMinutes, setSeconds);
                        if(finishRes.status === 200) {
                            await client.patch(selectedQuest._id)
                            .set({
                                statusType: 'FINISH', 
                                finishTx: finishRes.transactionId, 
                                finishDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                                completed: true,
                                updateMember: walletData.account
                            }).commit();
                            setFinishSelect({...finishSelect, finishTx: finishRes.transactionId});
                            setReloadData(!reloadData)
                            if(window.confirm('Are you sure you want to [Finish] this quest? (2/2)')) {
                                const accounts = await window.klaytn.enable();
                                const account = accounts[0];
                                const receipt = await GovernanceContract().methods.startDecision(selectedQuest.questKey).send({from : account})
                                console.log(receipt);
                                await client.patch(selectedQuest.governanceItem[0]._id)
                                .set({
                                    level: 'success', 
                                    successStartTime: Moment().format("yyyy-MM-DD HH:mm:ss"), 
                                    successEndTime: Moment().add(1, 'days').format("yyyy-MM-DD HH:mm:ss"),
                                    successTotalVote: 0,
                                    adjournTotalVote: 0
                                }).commit();
                                setFinishSelect({...finishSelect, successTime: Moment().format("yyyy-MM-DD HH:mm:ss")});
                                setReloadData(!reloadData)
                                toastNotify({
                                    state: 'success',
                                    message: 'finish success',
                                });
                            } else {
                                toastNotify({
                                    state: 'error',
                                    message: 'finish market failed (2/2)',
                                });
                                setReloadData(!reloadData)
                                return;
                            }
                        } else {
                            toastNotify({
                                state: 'error',
                                message: 'finish market failed (1/2)',
                            });
                            setReloadData(!reloadData)
                            return;
                        }
                    } else {
                        toastNotify({
                            state: 'error',
                            message: 'finish market failed (1/2)',
                        });
                        setReloadData(!reloadData)
                        return;
                    }
                }

                if(finishSelect.finishTx && !finishSelect.successStartTime) {
                    if(window.confirm('Are you sure you want to [Finish] this quest? (2/2)')) {
                        const accounts = await window.klaytn.enable();
                        const account = accounts[0];
                        const receipt = await GovernanceContract().methods.startDecision(selectedQuest.questKey).send({from : account})
                        console.log(receipt);
                        await client.patch(selectedQuest.governanceItem[0]._id)
                        .set({
                            level: 'success', 
                            successStartTime: Moment().format("yyyy-MM-DD HH:mm:ss"), 
                            successEndTime: Moment().add(1, 'days').format("yyyy-MM-DD HH:mm:ss"),
                            successTotalVote: 0,
                            adjournTotalVote: 0
                        }).commit();
                        setFinishSelect({...finishSelect, successTime: Moment().format("yyyy-MM-DD HH:mm:ss")});
                        setReloadData(!reloadData)
                        toastNotify({
                            state: 'success',
                            message: 'finish success',
                        });
                    } else {
                        toastNotify({
                            state: 'error',
                            message: 'finish market failed (2/2)',
                        });
                        setReloadData(!reloadData)
                        return;
                    }
                }
                break;
        
            case 'adjourn':
                if(!selectedQuest.completed) {
                    toastNotify({
                        state: 'error',
                        message: "Market is not Finished!",
                    });
                    return;
                }

                if(selectedQuest.adjournTx) {
                    toastNotify({
                        state: 'error',
                        message: "It is already adjourn.",
                    });
                    return;
                }

                const adjournRes = await callAdjournMarket(selectedQuest.questKey, walletData, setQr, setQrModal, setMinutes, setSeconds);
                if(adjournRes.status === 200) {
                    await client.patch(selectedQuest._id)
                            .set({
                                statusType: 'ADJOURN', 
                                questStatus: 'ADJOURN', 
                                adjournTx: adjournRes.transactionId,
                                adjournDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                                description: description,
                                updateMember: walletData.account
                            })
                            .commit();
                    
                    toastNotify({
                        state: 'success',
                        message: 'adjourn success',
                    });
                } else {
                    toastNotify({
                        state: 'error',
                        message: 'adjourn market failed.',
                    });
                }

                break;
                
            case 'success':
                if(!selectedQuest.completed) {
                    toastNotify({
                        state: 'error',
                        message: "Market is not Finished!",
                    });
                    return;
                }

                if(selectedQuest.successTx) {
                    toastNotify({
                        state: 'error',
                        message: "It is already success.",
                    });
                    return;
                }

                const successRes = await callSuccessMarket({ questKey: selectedQuest.questKey, questAnswerKey: selectedAnswer.questAnswerKey}, walletData, setQr, setQrModal, setMinutes, setSeconds);
                if(successRes.status === 200) {
                    await client.patch(selectedQuest._id)
                        .set({
                            statusType: 'SUCCESS', 
                            questStatus: 'SUCCESS', 
                            successTx: successRes.transactionId,
                            successDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                            selectedAnswer: selectedAnswer.title,
                            updateMember: walletData.account
                            })
                            .commit();

                    const market_total_ct = Number(selectedQuest.totalAmount);
                    const creator_ct = market_total_ct * Number(selectedQuest.creatorFee) / 100 + Number(selectedQuest.creatorPay);
                    
                    const transactionSet = {
                        _type: 'transactions',
                        amount: Number(creator_ct),
                        recipientAddress: selectedQuest.creatorAddress,
                        spenderAddress: cojamMarketAddress,
                        status: 'SUCCESS',
                        transactionId: successRes.transactionId,
                        transactionType: 'CREATOR_F',
                        createdDateTime: Moment().format('YYYY-MM-DD HH:mm:ss'),
                    }

                    await client.create(transactionSet);

                    toastNotify({
                        state: 'success',
                        message: 'SUCCESS MARKET success',
                    });
                } else {
                    toastNotify({
                        state: 'error',
                        message: 'SUCCESS MARKET failed.',
                    });
                }

                break;
            
            case 'retrieve':
                if(!selectedQuest.completed) {
                    toastNotify({
                        state: 'error',
                        message: "Market is not Finished!",
                    });
                    return;
                }

                if(selectedQuest.retrieveTx) {
                    toastNotify({
                        state: 'error',
                        message: "Market is already retrieve!",
                    });
                    return;
                }

                if(!selectedQuest.successTx) {
                    toastNotify({
                        state: 'error',
                        message: "Market is not Success!",
                    });
                    return;
                }	

                const diffDays = Moment().diff(Moment(selectedQuest.successDateTime), 'days');
                if(diffDays <= 180) {
                    toastNotify({
                        state: 'error',
                        message: "Market can be retrieved later 180 days from success!",
                    });
                    return;
                }

                const retrieveRes = await callRetrieveMarket(selectedQuest.questKey, walletData, setQr, setQrModal, setMinutes, setSeconds);
                if(retrieveRes.status === 200) {
                    await client.patch(selectedQuest._id)
                                .set({statusType: 'RETRIEVE', retrieveTx: retrieveRes.transactionId})
                                .commit();

                    toastNotify({
                        state: 'success',
                        message: "retrieve success",
                    });
                } else {
                    toastNotify({
                        state: 'success',
                        message: "retrieve failed",
                    });
                }
                break;	
        }
    } catch(error) {
        console.log(error);

        toastNotify({
            state: 'error',
            message: "transaction execute failed",
        });
    }
}