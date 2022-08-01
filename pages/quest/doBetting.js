import { client } from "../../sanity";
import Moment from 'moment';
import { callApproveCojamURI, callBettingCojamURI } from "@api/UseTransactions";

const doBetting = async (betting, walletData, setQr, setQrModal, setMinutes, setSeconds, setLoading) => {
    let result = {result: false, message: 'Voting failed'};

    // compare with initial answer (if exist)
    const bettingQuery = `*[_type == 'betting' && memberKey == '${betting.memberKey}' && questKey == ${betting.questKey} && questAnswerKey != '${betting.questAnswerKey._id}' && _id != '${Date.now()}'][0]`;
    const res = await client.fetch(bettingQuery).then((betting) => {
        if(betting?._id) {
            return {
                result: false,
                message: `can vote more in only initial answer. initial answer : [${betting.answerTitle}]`
            }
        } else {
            return {
                result: true
            }
        }
    });

    if(!res.result) {
        return res;
    }

    // Quest 정보 load
    const questQuery = `*[_type == 'quests' && isActive == true && questKey == ${betting.questKey} && _id != '${Date.now()}'][0]`;
    await client.fetch(questQuery).then(async (quest) => {
        const seasonQuery = `*[_type == 'season' && isActive == true && _id == '${quest.season._ref}']{..., 'now': now()}[0]`;
        await client.fetch(seasonQuery).then(async (joinedSeason) => {
            const detail = Object.assign(joinedSeason, quest);

            // is Market closed
            if(Moment(detail.endDateTime).diff(Moment(detail.now), 'seconds') <= 0) {
                result = {
                    result: false,
                    message: `Voting is closed`,
                };
                return;
            }

            const answerQuery = `*[_type == 'questAnswerList' && _id == '${betting.questAnswerKey._id}' && _id != '${Date.now()}'][0]`;
            await client.fetch(answerQuery).then(async (answer) => {
                if(!answer) {
                    result = {
                        result: false,
                        message: `questAnswer no data`,
                    };
                    return;
                }

                betting.questAnswerKey.order = answer.questAnswerKey;

                const walletAddress = walletData.account;

                if(detail.finishTx) {
                    result = {
                        result: false,
                        message: `Already Finished!`,
                    };
                    return;
                }

                if(detail.questStatus !== "APPROVE") {
                    result = {
                        result: false,
                        message: `Market is not approved.`,
                    };
                    return;
                }

                if(detail.pending) {
                    result = {
                        result: false,
                        message: `Market is pending.`,
                    };
                    return;
                }
                
                // memberKey == walletAddress
                const member = {
                    memberKey: walletAddress,
                }
                
                const memberQuery = `*[_type == 'member' && _id != '${Date.now()}' && _id == '${member.memberKey}']`;
                await client.fetch(memberQuery).then(async (queryResult) => {
                    if(betting.curBalance < betting.bettingCoin) {
                        result = {
                            result: false,
                            message: `Please check your balance.`,
                        };
                        return;
                    }

                    const min = detail.minimumPay;
                    const max = detail.maximumPay;
                    
                    if(betting.bettingCoin < min) {
                        result = {
                            result: false,
                            message: `You have to vote more CT than the minimum number of voting. (Minimum : ${min} CT)`,
                        };
                        return;
                    } 

                    if(betting.bettingCoin > max) {
                        result = {
                            result: false,
                            message: `You have to vote more CT than the maximum number of voting. (Maximum : ${max} CT)`
                        };

                        return;
                    }

                    let newBettingKey;
                    await client.fetch(`*[_type == "betting" && _id != '${Date.now()}'] | order(bettingKey desc)[0]`).then(async (lastBetting) => {
                        newBettingKey = Number(lastBetting.bettingKey) + 1;
                    });
                
                    // do approve
                    await callApproveCojamURI(Number(betting.bettingCoin), walletData, setQr, setQrModal, setMinutes, setSeconds).then(async (res) => {
                        if(res.status === 200) {
                            // do betting 
                            await callBettingCojamURI({
                                    questKey: betting.questKey, 
                                    questAnswerKey: betting.questAnswerKey.order,
                                    bettingKey: newBettingKey, 
                                    bettingCoinAmount: betting.bettingCoin,
                                }, walletData, setQr, setQrModal, setMinutes, setSeconds
                            ).then(async (res) => {
                                if(!res) {
                                    return result = {
                                        result: false,
                                        message: 'Voting api failed'
                                    };
                                }

                                setLoading(true);

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
                                        status: 'SUCCESS',
                                        amount: Number(betting.bettingCoin),
                                        recipientAddress: res.spenderAddress,
                                        spenderAddress: walletAddress,
                                        createdDateTime: Moment().format('YYYY-MM-DD HH:mm:ss'),
                                    }
                
                                    await client.create(transactionSet);

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

                                setLoading(false);
                            });
                        } else {
                            result =  {
                                result: false,
                                message: 'Approve failed'
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