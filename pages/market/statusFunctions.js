import { client } from "../../sanity";
//import { draftMarket, addAnswerKeys, approveMarket, adjournMarket, retrieveMarket, successMarket, finishMarket } from "@api/UseKaikas";
import { callDraftMarket, callAddAnswerKeys, callApproveMarket, callAdjournMarket, callRetrieveMarket, callSuccessMarket, callFinishMarket } from "@api/UseTransactions";
import Moment from 'moment';

const cojamMarketAddress = '0x864804674770a531b1cd0CC66DF8e5b12Ba84A09';  // KAS address

export const changeStateFunction = async (state, walletData, selectedQuest, selectedAnswer, description) => {
    if(!window.confirm('change ground status to [ ' + state + ' ] ?')) {
        return;
    }

     // Check login
     if( walletData?.type === 'kaikas' ) {
        if( !klaytn.selectedAddress ) {
            alert('login please.');
            return;
        }
    } else {
        if( !walletData.account ) {
            alert('login please.');
            return;
        }
    }
    
    switch(state) {
        case 'pend' :
            client.patch(selectedQuest._id)
                  .set({ pending: true })
                  .commit();

            alert('pend success');			
            break;

        case 'unpend' :
            client.patch(selectedQuest._id)
                  .set({ pending: false })
                  .commit();

            alert('unpend success');					  
            break;

        case 'invalid': 
            client.patch(selectedQuest._id)
                  .set({
                      questStatus: 'INVALID', 
                      description: 'INVALID DESC',
                      updateMember: walletData.account
                  })
                  .commit();

            alert('invalid success');			
            break;
            
        case 'draft':
            const seasonQuery = `*[_type == 'season' && isActive == true && _id == '${selectedQuest.season._ref}'][0]`;
            client.fetch(seasonQuery).then(async (season) => {
                if(season) {
                    if(!selectedQuest.draftTx) {
                        const questKey = selectedQuest.questKey;
                        const creatorPay = Number(season.creatorPay) / 10 ** 18;

                        await callDraftMarket({
                            marketKey: questKey, 
                            creator: season.creatorAddress, 
                            title: season.title, 
                            creatorFee: creatorPay, 
                            creatorFeePercentage: season.creatorFee, 
                            cojamFeePercentage: season.cojamFee, 
                            charityFeePercentage: season.charityFee
                        }, walletData).then(async (res) => {
                            if(res.status === 200) {
                                client.patch(selectedQuest._id)
                                      .set({
                                          statusType: 'DRAFT', 
                                          draftTx: res.transactionId,
                                          draftDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                                          updateMember: walletData.account
                                      })
                                      .commit();

                                alert('draft success');
                            } else {
                                alert('draft failed');
                            }
                        });
                    } else {
                        alert('Draft is already Registerd!');
                    }
                }
            });

            break;

        case 'answer':
            if(!selectedQuest.isActive) {
                alert("Don't active Season.");
                return;
            }

            if(!selectedQuest.draftTx) {
                alert("Draft is Null!");
                return;
            }

            if(selectedQuest.answerTx) {
                alert("Answers is already Registerd!");
                return;
            }

            const bettingKeyQuery = `*[_type == 'questAnswerList' && questKey == ${selectedQuest.questKey} ]`;
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

                    addAnswerRes = await callAddAnswerKeys({marketKey: selectedQuest.questKey, answerKeys: bettingKeyListCopy}, walletData);
                }
            } else {
                addAnswerRes = await callAddAnswerKeys({marketKey: selectedQuest.questKey, answerKeys: bettingKeyList}, walletData);
            }

            if(addAnswerRes.status === 200) {
                client.patch(selectedQuest._id)
                      .set({
                          statusType: 'ANSWER', 
                          answerTx: addAnswerRes.transactionId,
                          answerDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                          updateMember: walletData.account
                        })
                      .commit();

                alert('Answer approve success');
            } else {
                alert("Answer approve fail.");
                return;
            }

            break;
        
        case 'approve':
            if(!selectedQuest.isActive) {
                alert("Don't active Season.");
                return;
            }

            if(!selectedQuest.answerTx) {
                alert("Answers is not Confirmed!");
                return;
            }

            if(selectedQuest.approveTx) {
                alert("Approve is already Registerd!");
                return;
            }

            const approveMarketRes = await callApproveMarket({marketKey: selectedQuest.questKey}, walletData);

            if(approveMarketRes.status === 200) {
                client.patch(selectedQuest._id)
                      .set({
                            statusType: 'APPROVE', 
                            questStatus: 'APPROVE',
                            approveTx: approveMarketRes.transactionId,
                            approveDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                            updateMember: walletData.account
                        })
                      .commit();
                
                alert('approve market success');
            } else {
                alert('approve market failed');
            }

            break;

        case 'hot':
            client.patch(selectedQuest._id)
                  .set({hot: true})
                  .commit();
            break;
        
        case 'finish':
            if(selectedQuest.completed) {
                alert("Already Finished!");
                return;
            }

            if(selectedQuest.questStatus !== 'APPROVE') {
                alert("Market is not approved.");
                return;
            }

            if(selectedQuest.pending) {
                alert("Market is pended.");
                return;
            }

            const questKey = selectedQuest.questKey;
            await callFinishMarket({marketKey: questKey}, walletData).then((res) => {
                if(res.status === 200) {
                    client.patch(selectedQuest._id)
                          .set({
                              statusType: 'FINISH', 
                              finishTx: res.transactionId, 
                              finishDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                              completed: true,
                              updateMember: walletData.account
                            })
                          .commit();

                    alert('finish success');
                } else {
                    alert('finish failed');
                }
            });

            break;
    
        case 'adjourn':
            if(selectedQuest.completed) {
                alert("Market is not Finished!");
                return;
            }

            if(selectedQuest.adjournTx) {
                alert("It is already adjourn.");
                return;
            }

            const adjournRes = await callAdjournMarket({ questKey: selectedQuest.questKey}, walletData);
            if(adjournRes.status === 200) {
                client.patch(selectedQuest._id)
                          .set({
                              statusType: 'ADJOURN', 
                              questStatus: 'ADJOURN', 
                              adjournTx: res.transactionId,
                              adjournDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                              updateMember: walletData.account
                            })
                          .commit();

                alert('adjourn success');
            } else {
                alert('adjourn market failed.');
            }

            break;
            
        case 'success':
            if(!selectedQuest.completed) {
                alert("Market is not Finished!");
                return;
            }

            if(selectedQuest.successTx) {
                alert("It is already success.");
                return;
            }

            const successRes = await callSuccessMarket({ questKey: selectedQuest.questKey, questAnswerKey: selectedAnswer.questAnswerKey}, walletData);
            if(successRes.status === 200) {
                client.patch(selectedQuest._id)
                      .set({
                          statusType: 'SUCCESS', 
                          questStatus: 'SUCCESS', 
                          successTx: successRes.transactionId,
                          successDateTime: Moment().format("yyyy-MM-DD HH:mm:ss"),
                          selectedAnswer: selectedAnswer.title,
                          updateMember: walletData.account
                        })

                const market_total_ct = selectedQuest.totalAmount;
                const creator_ct = market_total_ct * selectedQuest.creatorFee / 100 + selectedQuest.creatorPay;
                
                const transactionSet = {
                    _type: 'transactions',
                    amount: creator_ct / 10 ** 18,
                    recipientAddress: selectedQuest.creatorAddress,
                    spenderAddress: cojamMarketAddress,
                    status: 'SUCCESS',
                    transactionId: successRes.transactionId,
                    transactionType: 'CREATOR_F',
                    createdDateTime: Moment().format('YYYY-MM-DD HH:mm:ss'),
                }

                client.create(transactionSet);

                alert('SUCCESS MARKET success');
            } else {
                alert('SUCCESS MARKET failed.');
            }

            break;
        
        case 'retrieve':
            if(!selectedQuest.completed) {
                alert("Market is not Finished!");
                return;
            }

            if(selectedQuest.retrieveTx) {
                alert("Market is already retrieve!");
                return;
            }

            if(!selectedQuest.successTx) {
                alert("Market is not Success!");
                return;
            }	

            const diffDays = Moment().diff(Moment(selectedQuest.successDateTime), 'days');
            if(diffDays <= 180) {
                alert("Market can be retrieved later 180 days from success!");
                return;
            }

            const retrieveRes = await callRetrieveMarket({ questKey: selectedQuest.questKey}, walletData);
            if(retrieveRes.status === 200) {
                client.patch(selectedQuest._id)
                .set({statusType: 'RETRIEVE', retrieveTx: retrieveRes.transactionId})
                .commit();

                alert("retrieve success");
            } else {
                alert("retrieve failed");
            }

            break;	
    }
}