import { urlFor, client } from "../../sanity";

import Moment, { now } from 'moment';
import { approveCojamURI, bettingCojamURI, getMarketCojamURI } from "@api/UseKaikas";

//import { kaikasGetBalance } from '@api/UseKaikas';

const doBetting = async (betting) => {
    console.log('do bet', betting);
    
    let result = {result: false, message: 'betting failed'};
    //현재 season 정보
    //const query = `*[_type=='quests']{season._id, season._id{title -> {...}}}`;
    //const query = `*[_type=="quests"] { seanson, "seasons": *[_type=='season' && references(^._id)]{ ... } }`

    const questQuery = `*[_type == 'quests' && isActive == true && questKey == ${betting.questKey}][0]`;
    await client.fetch(questQuery).then(async (quest) => {
        console.log('quest', quest);

        const seasonQuery = `*[_type == 'season' && isActive == true && _id == '${quest.season._ref}']{..., 'now': now()}[0]`;
        await client.fetch(seasonQuery).then(async (joinedSeason) => {
            console.log('joinedSeason', joinedSeason);

            const detail = Object.assign(joinedSeason, quest);
            console.log('detail', detail);

            // is Market closed
            if(Moment(detail.endDateTime).diff(Moment(detail.now), 'seconds') <= 0) {
                alert('Voting is closed');
                return;
            }

            const answerQuery = `*[_type == 'questAnswerList' && _id == '${betting.questAnswerKey._id}'][0]`;
            await client.fetch(answerQuery).then(async (answer) => {
                console.log('quest answer', answer);
                if(!answer) {
                    alert('questAnswer no data');
                    return;
                }

                betting.questAnswerKey.order = answer.questAnswerKey;

                console.log('answer key', betting.questAnswerKey._id);
                console.log('quest key', betting.questKey);

                const accounts = await window.klaytn.enable();
                const walletAddress = accounts[0];
                if(walletAddress === undefined) {
                    alert('"Already Finished!"');
                    return;
                }

                // TODO CHECK
                const etherUnit = 18;
                const amount = betting.bettingCoin / 10 ** etherUnit;
                const marketAddress = "0xC31585Bf0808Ab4aF1acC29E0AA6c68D2B4C41CD";

                if(detail.finishTx) {
                    alert('"Already Finished!"');
                    return;
                }

                if(detail.questStatus !== "APPROVE") {
                    alert("Market is not approved.");
                    return;
                }

                if(detail.pending) {
                    alert("market is pending.");
                    return;
                }
                
                // memberKey == walletAddress
                const member = {
                    memberKey: walletAddress,
                }
                
                const memberQuery = `*[_type == 'member' && _id == '${member.memberKey}']`;
                await client.fetch(memberQuery).then(async (queryResult) => {
                    console.log('member', queryResult, betting.curBalance);

                    const curBalance = betting.curBalance;
                    console.log('betting curBalance', curBalance);

                    if(curBalance < betting.bettingCoin) {
                        alert("Please check your balance.");
                        return;
                    }

                    const min = detail.minimumPay;
                    const max = detail.maximunPay;
                    
                    if(betting.bettingCoin < min) {
                        alert(`You have to vote more CT than the minimum number of voting. (Minimum : " + ${min} + "CT)`)
                        return;
                    } 

                    if(betting.bettingCoin > max) {
                        alert(`You have to vote more CT than the maximum number of voting. (Maximum : " + ${max} + "CT)`)
                        return;
                    }

                    // TODO CHECK ACCOUNT MEMBER KEY ? & betting._id
                    let newBettingKey;
                    await client.fetch(`count(*[_type == "betting"])`).then(async (order) => {
                        newBettingKey = Number(order) + 1;
                    });
                
                    // TODO contract 호출 확인
                    console.log('quest keys', betting.questKey, betting.questAnswerKey.order, newBettingKey);
                    console.log('bettingCoinAmount', betting.bettingCoin);

                    let approveTxReceipt;
                    await approveCojamURI(betting.bettingCoin).then((res) => {
                        console.log('approve tx receipt', res);
                        approveTxReceipt = res.transactionId;
                    });

                    await bettingCojamURI({ 
                        questKey: betting.questKey, 
                        questAnswerKey: betting.questAnswerKey.order, 
                        bettingKey: newBettingKey, 
                        bettingCoinAmount: betting.bettingCoin
                    }).then(async (res) => {
                        if(!res) {
                            return result = {
                                result: false,
                                message: 'betting api failed'
                            };;
                        }

                        if(res.status !== 100) {
                            console.log('betting update !!!! ', res);

                            const bettingParam = {
                                _type: 'betting',
                                bettingKey: newBettingKey,
                                multiply: betting.multiply,
                                predictionFee: betting.predictionFee,
                                bettingCoin: betting.bettingCoin,
                                spenderAddress: '',
                                transactionId: '',
                                bettingStatus: 'ONGOING',
                                questKey: betting.questKey,
                                questAnswerKey: betting.questAnswerKey._id,
                                memberKey: member.memberKey,
                                receiveAddress: '',
                                answerTitle: betting.answerTitle,
                                createdDateTime: Moment().format('YYYY-MM-DD HH:mm:ss'),
                            }
        
                            await client.create(bettingParam).then((res) => {
                                console.log('betting id : ' + res._id);
                                betting.bettingKey = newBettingKey;
                                betting.bettingId = res._id;
                            });


                            // update quest answer total amount
                            const newAnswerTotalQuery = `*[_type == 'betting' && questAnswerKey == '${betting.questAnswerKey._id}'] {bettingCoin}`;
                            await client.fetch(newAnswerTotalQuery).then((bettingCoins) => {
                                const newAnswerTotal = bettingCoins.reduce((acc, bettingCoin) => {
                                    return acc += Number(bettingCoin.bettingCoin);
                                }, 0);

                                client.patch(betting.questAnswerKey._id)
                                    .set({totalAmount: newAnswerTotal + betting.bettingCoin})
                                    .commit();
                            });

                            // update quest total amount
                            const newQuestTotalQuery = `*[_type == 'betting' && questKey == ${betting.questKey}] {bettingCoin}`;
                            await client.fetch(newQuestTotalQuery).then((bettingCoins) => {
                                const newQuestTotal = bettingCoins.reduce((acc, bettingCoin) => {
                                    return acc += Number(bettingCoin.bettingCoin);
                                }, 0);

                                client.patch(detail._id)
                                    .set({totalAmount: newQuestTotal + betting.bettingCoin})
                                    .commit();
                            });

                            // update betting result
                            const updateBetSet = {
                                spenderAddress: res.spenderAddress,
                                transactionId: res.transactionId,
                            }

                            console.log('update bet with updateBetSet', updateBetSet);
                            client.patch(betting.bettingId).set(updateBetSet).commit();

                            const transactionSet = {
                                _type: 'transactions',
                                transactionId: res.transactionId,
                                transactionType: 'BETTION_S',
                                amount: betting.bettingCoin,
                                recipientAddress: walletAddress,
                                spenderAddress: res.spenderAddress,
                                createdDateTime: Moment().format('YYYY-MM-DD HH:mm:ss'),
                            }
        
                            await client.create(transactionSet).then((res) => {
                                console.log('transaction add complete');
                            });

                            result = {
                                result: true,
                                message: 'betting success'
                            };
                        } else {
                            result =  {
                                result: false,
                                message: 'betting failed'
                            };
                        }
                    });
                });
            });
        });
    });

    return result;
}

export default doBetting;