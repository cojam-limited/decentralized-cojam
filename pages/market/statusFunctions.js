import { client } from "../../sanity";
import { kaikasLogin, draftMarket, addAnswerKeys, approveMarket, adjournMarket, retrieveMarket, successMarket, finishMarket } from "@api/UseKaikas";
import Moment, { now } from 'moment';

const cojamMarketAddress = '0x864804674770a531b1cd0CC66DF8e5b12Ba84A09';  // KAS address

export const changeStateFunction = async (state, walletAddress, selectedQuest, selectedAnswer, description) => {
    if(!window.confirm('change ground status to [ ' + state + ' ] ?')) {
        return;
    }

    const account = await kaikasLogin();
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
            // TODO accept description
            client.patch(selectedQuest._id)
                  .set({
                      questStatus: 'INVALID', 
                      description: 'INVALID DESC',
                      updateMember: walletAddress
                  })
                  .commit();
            // TODO ADD mailing

            alert('invalid success');			
            break;
            
        case 'draft':
            const seasonQuery = `*[_type == 'season' && isActive == true && _id == '${selectedQuest.season._ref}'][0]`;
            client.fetch(seasonQuery).then(async (season) => {
                if(season) {
                    if(!selectedQuest.draftTx) {
                        const questKey = selectedQuest.questKey;
                        const creatorPay = Number(season.creatorPay) / 10 ** 18;

                        await draftMarket({
                            marketKey: questKey, 
                            creator: season.creatorAddress, 
                            title: season.title, 
                            creatorFee: creatorPay, 
                            creatorFeePercentage: season.creatorFee, 
                            cojamFeePercentage: season.cojamFee, 
                            charityFeePercentage: season.charityFee
                        }).then(async (res) => {
                            console.log('draft done.', res, res.transactionId);
                            
                            if(res.status) {
                                client.patch(selectedQuest._id)
                                      .set({
                                          statusType: 'DRAFT', 
                                          draftTx: res.transactionId,
                                          draftDateTime: Moment(now()).format("yyyy-MM-DD HH:mm:ss"),
                                          updateMember: walletAddress
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

            // TODO add confirm answer ?

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

                    addAnswerRes = await addAnswerKeys({marketKey: selectedQuest.questKey, answerKeys: bettingKeyListCopy});
                }
            } else {
                addAnswerRes = await addAnswerKeys({marketKey: selectedQuest.questKey, answerKeys: bettingKeyList});
            }

            if(addAnswerRes.status) {
                client.patch(selectedQuest._id)
                      .set({
                          statusType: 'ANSWER', 
                          answerTx: addAnswerRes.transactionId,
                          answerDateTime: Moment(now()).format("yyyy-MM-DD HH:mm:ss"),
                          updateMember: walletAddress
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

            // TODO add confirm

            if(selectedQuest.approveTx) {
                alert("Approve is already Registerd!");
                return;
            }

            const approveMarketRes = await approveMarket({marketKey: selectedQuest.questKey});

            if(approveMarketRes.status) {
                client.patch(selectedQuest._id)
                      .set({
                            statusType: 'APPROVE', 
                            questStatus: 'APPROVE',
                            approveTx: approveMarketRes.transactionId,
                            approveDateTime: Moment(now()).format("yyyy-MM-DD HH:mm:ss"),
                            updateMember: walletAddress
                        })
                      .commit();
                
                alert('approve market success');
            } else {
                alert('approve market failed');
            }

            // TODO email sending
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
            finishMarket({marketKey: questKey}).then((res) => {
                if(res.status) {
                    client.patch(selectedQuest._id)
                          .set({
                              statusType: 'FINISH', 
                              finishTx: res.transactionId, 
                              finishDateTime: Moment(now()).format("yyyy-MM-DD HH:mm:ss"),
                              completed: true,
                              updateMember: walletAddress
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

            // TODO add confirm check

            if(selectedQuest.adjournTx) {
                alert("It is already adjourn.");
                return;
            }

            const adjournRes = await adjournMarket({ questKey: selectedQuest.questKey });
            if(adjournRes.status) {
                client.patch(selectedQuest._id)
                          .set({
                              statusType: 'ADJOURN', 
                              questStatus: 'ADJOURN', 
                              adjournTx: res.transactionId,
                              adjournDateTime: Moment(now()).format("yyyy-MM-DD HH:mm:ss"),
                              updateMember: walletAddress
                            })
                          .commit();

                alert('adjourn success');
            } else {
                alert('adjourn market failed.');
            }

            // TODO push logic
            break;
            
        case 'success':
            console.log('status function', selectedAnswer.title, selectedAnswer.questAnswerKey);
            if(!selectedQuest.completed) {
                alert("Market is not Finished!");
                return;
            }

            // TODO finish tx confirm

            if(selectedQuest.successTx) {
                alert("It is already success.");
                return;
            }

            const successRes = await successMarket({ questKey: selectedQuest.questKey, questAnswerKey: selectedAnswer.questAnswerKey });
            if(successRes.status) {
                client.patch(selectedQuest._id)
                      .set({
                          statusType: 'SUCCESS', 
                          questStatus: 'SUCCESS', 
                          successTx: successRes.transactionId,
                          successDateTime: Moment(now()).format("yyyy-MM-DD HH:mm:ss"),
                          selectedAnswer: selectedAnswer.title,
                          updateMember: walletAddress
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

            const today = now();
            const diffDays = Moment(today).diff(Moment(selectedQuest.successDateTime), 'days');
            if(diffDays <= 180) {
                alert("Market can be retrieved later 180 days from success!");
                return;
            }

            const retrieveRes = await retrieveMarket({ questKey: selectedQuest.questKey });
            if(retrieveRes.status) {
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