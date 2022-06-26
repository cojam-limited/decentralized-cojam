import { client } from "../../sanity";
import Moment from 'moment';
import { callApproveCojamURI, callBettingCojamURI } from "@api/UseTransactions";
import toastNotify from '@utils/toast';

const doBetting = async (betting, walletData) => { 
    let result = {result: false, message: 'Voting failed'};

    // Quest 정보 load
    const questQuery = `*[_type == 'quests' && isActive == true && questKey == ${betting.questKey} && _id != '${Date.now()}'][0]`;
    await client.fetch(questQuery).then(async (quest) => {

        const seasonQuery = `*[_type == 'season' && isActive == true && _id == '${quest.season._ref}']{..., 'now': now()}[0]`;
        await client.fetch(seasonQuery).then(async (joinedSeason) => {
            const detail = Object.assign(joinedSeason, quest);

            // is Market closed
            if(Moment(detail.endDateTime).diff(Moment(detail.now), 'seconds') <= 0) {
                toastNotify({
                    state: 'warn',
                    message: 'Voting is closed',
                });
                return;
            }

            const answerQuery = `*[_type == 'questAnswerList' && _id != '${Date.now()}' && _id == '${betting.questAnswerKey._id}'][0]`;
            await client.fetch(answerQuery).then(async (answer) => {
                if(!answer) {
                    toastNotify({
                        state: 'warn',
                        message: 'questAnswer no data',
                    });
                    return;
                }

                betting.questAnswerKey.order = answer.questAnswerKey;

                const walletAddress = walletData.account;

                if(detail.finishTx) {
                    toastNotify({
                        state: 'warn',
                        message: 'Already Finished!',
                    });
                    return;
                }

                if(detail.questStatus !== "APPROVE") {
                    toastNotify({
                        state: 'warn',
                        message: "Market is not approved.",
                    });
                    return;
                }

                if(detail.pending) {
                    toastNotify({
                        state: 'warn',
                        message: "Market is pending.",
                    });
                    return;
                }
                
                // memberKey == walletAddress
                const member = {
                    memberKey: walletAddress,
                }
                
                const memberQuery = `*[_type == 'member' && _id != '${Date.now()}' && _id == '${member.memberKey}']`;
                await client.fetch(memberQuery).then(async (queryResult) => {
                    if(betting.curBalance < betting.bettingCoin) {
                        toastNotify({
                            state: 'warn',
                            message: "Please check your balance.",
                        });
                        return;
                    }

                    const min = detail.minimumPay;
                    const max = detail.maximunPay;
                    
                    if(betting.bettingCoin < min) {
                        toastNotify({
                            state: 'warn',
                            message: `You have to vote more CT than the minimum number of voting. (Minimum : ${min} CT)`,
                        });
                        return;
                    } 

                    if(betting.bettingCoin > max) {
                        toastNotify({
                            state: 'warn',
                            message: `You have to vote more CT than the maximum number of voting. (Maximum : ${max} CT)`,
                        });
                        return;
                    }

                    let newBettingKey;
                    await client.fetch(`*[_type == "betting" && _id != '${Date.now()}'] | order(bettingKey desc)[0]`).then(async (lastBetting) => {
                        newBettingKey = Number(lastBetting.bettingKey) + 1;
                    });
                
                    // do approve
                    await callApproveCojamURI(Number(betting.bettingCoin), walletData).then((res) => {
                        // TODO REMOVE
                    });
                    
                    // do betting 
                    await callBettingCojamURI({ 
                        questKey: betting.questKey, 
                        questAnswerKey: betting.questAnswerKey.order,
                        bettingKey: newBettingKey, 
                        bettingCoinAmount: betting.bettingCoin
                    }, walletData).then(async (res) => {
                        if(!res) {
                            return result = {
                                result: false,
                                message: 'Voting api failed'
                            };;
                        }

                        if(res.status === 200) {
                            // insert betting info
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
                                betting.bettingKey = newBettingKey;
                                betting.bettingId = res._id;
                            });

                            // update each quest answer total amount
                            const newAnswerTotalQuery = `*[_type == 'betting' && questAnswerKey == '${betting.questAnswerKey._id}' && _id != '${Date.now()}'] {bettingCoin}`;
                            await client.fetch(newAnswerTotalQuery).then(async (bettingCoins) => {
                                const newAnswerTotal = bettingCoins.reduce((acc, bettingCoin) => {
                                    return acc += Number(bettingCoin.bettingCoin);
                                }, 0);

                                await client.patch(betting.questAnswerKey._id)
                                    .set({totalAmount: newAnswerTotal})
                                    .commit();
                            });

                            // update quest total amount
                            const newQuestTotalQuery = `*[_type == 'betting' && questKey == ${betting.questKey} && _id != '${Date.now()}'] {bettingCoin}`;
                            await client.fetch(newQuestTotalQuery).then(async (bettingCoins) => {
                                const newQuestTotal = bettingCoins.reduce((acc, bettingCoin) => {
                                    return acc += Number(bettingCoin.bettingCoin);
                                }, 0);

                                await client.patch(detail._id)
                                            .set({totalAmount: newQuestTotal})
                                            .commit();
                            });

                            // update betting result
                            const updateBetSet = {
                                spenderAddress: res.spenderAddress,
                                transactionId: res.transactionId,
                            }

                            await client.patch(betting.bettingId).set(updateBetSet).commit();

                            // insert transaction
                            const transactionSet = {
                                _type: 'transactions',
                                transactionId: res.transactionId,
                                transactionType: 'BETTION_S',
                                amount: betting.bettingCoin,
                                recipientAddress: res.spenderAddress,
                                spenderAddress: walletAddress,
                                createdDateTime: Moment().format('YYYY-MM-DD HH:mm:ss'),
                            }
        
                            await client.create(transactionSet).then((res) => {
                                console.log('transaction add complete');
                            });

                            result = {
                                result: true,
                                message: 'Voting success'
                            };
                        } else {
                            result =  {
                                result: false,
                                message: 'Voting failed'
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