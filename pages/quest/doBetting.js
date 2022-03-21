import { urlFor, client } from "../../sanity";

import Moment, { now } from 'moment';
import Caver from 'caver-js';
import NFTABI from '@abi/NFT.json';

const approveContract = (wallet, marketAddress, amount) => {
    
}

const doBetting = async (betting) => {
    console.log('do bet', betting);

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
                console.log('Voting is closed');
                return;
            }

            const answerQuery = `*[_type == 'questAnswerList' && _id == '${betting.questAnswerKey._id}'][0]`;
            await client.fetch(answerQuery).then(async (answer) => {
                console.log('quest answer', answer);
                if(!answer) {
                    console.log('questAnswer no data');
                    return;
                }

                // TODO ADD Wallet logic
                // TODO ADD Wallet logic
                // TODO ADD Wallet logic
                console.log('answer key', betting.questAnswerKey._id);
                console.log('quest key', betting.questKey);

                const accounts = await window.klaytn.enable();
                const walletAddress = accounts[0];
                if(walletAddress === undefined) {
                    console.log('"Already Finished!"');
                    return;
                }


                const etherUnit = 18;
                const amount = betting.bettingCoin * etherUnit;
                const marketAddress = "0xC31585Bf0808Ab4aF1acC29E0AA6c68D2B4C41CD";

                if(detail.finishTx) {
                    console.log('"Already Finished!"');
                    return;
                }

                // TODO === -> !==
                if(detail.questStatus === "APPROVE") {
                    console.log("Market is not approved.");
                    return;
                }

                if(detail.pending) {
                    console.log("arket is pended.");
                    return;
                }
                
                // TOOD CHECK MEMBER KEY
                // TODO ADD 지갑 Address 로 member 가져오면 될듯
                const member = {
                    memberKey: 'test_member',
                };
                
                const memberQuery = `*[_type == 'member' && _id == '${member.memberKey}']`;
                await client.fetch(memberQuery).then(async (queryResult) => {
                    console.log('member', queryResult);

                    if(!queryResult || queryResult.balance < betting.bettingCoin) {
                        console.log("Please check your balance.");
                        return;
                    }

                    const min = detail.minimumPay;
                    const max = detail.maximunPay;
                    
                    if(betting.bettingCoin < min) {
                        console.log(`You have to vote more CT than the minimum number of voting. (Minimum : " + ${min} + "CT)`)
                        return;
                    } 

                    if(betting.bettingCoin > max) {
                        console.log(`You have to vote more CT than the maximum number of voting. (Maximum : " + ${max} + "CT)`)
                        return;
                    }

                    // TODO CHECK ACCOUNT MEMBER KEY ? & betting._id
                    await client.fetch(`count(*[_type == "betting"])`).then((order) => {
                        const bettingParam = {
                            _type: 'betting',
                            bettingKey: order + 1,
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

                        console.log('create betting', bettingParam);
                        client.create(bettingParam).then((res) => {
                            console.log('betting id : ' + res._id);
                        });
                    });


                    // update quest answer total amount
                    console.log('set new answer total after betting', betting);
                    const newAnswerTotalQuery = `*[_type == 'betting' && questAnswerKey == '${betting.questAnswerKey._id}'] {bettingCoin}`;
                    await client.fetch(newAnswerTotalQuery).then((bettingCoins) => {
                        const newAnswerTotal = bettingCoins.reduce((acc, bettingCoin) => {
                            return acc += Number(bettingCoin.bettingCoin);
                        }, 0);

                        console.log('newAnswerTotal', newAnswerTotal + betting.bettingCoin);
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

                        console.log('newQuestTotal', newQuestTotal + betting.bettingCoin);
                        client.patch(detail._id)
                              .set({totalAmount: newQuestTotal + betting.bettingCoin})
                              .commit();
                    });
                    

                    // TODO TODO !!
                    // contract 호출
                    // contract 호출
                    // contract 호출
                    const questKeyInt = Number(betting.questKey);
                    const questAnswerKeyInt = Number(betting.questAnswerKey);
                    const coinAmount = Number(betting.bettingCoin )* 18;

                    const resultApprove = '';

                    //KAS API 호출 시 필요한 헤더
                    const option = {
                        headers: [
                        {
                            name: 'Authorization',
                            value:
                            'Basic ' +
                            Buffer.from(process.env.REACT_APP_ACCESS_KEY_ID + ':' + process.env.REACT_APP_SECRET_ACCESS_KEY).toString(
                                'base64',
                            ),
                        },
                        { name: 'x-chain-id', value: process.env.REACT_APP_CHAIN_ID },
                        ],
                    };
                    
                    //"market address : 0xC31585Bf0808Ab4aF1acC29E0AA6c68D2B4C41CD"

                    //KAS API 사용을 위한 객체 생성
                    const caver = new Caver(new Caver.providers.HttpProvider('https://node-api.klaytnapi.com/v1/klaytn', option));
                    
                    //참조 ABI와 스마트컨트랙트 주소를 통해 스마트컨트랙트 연동
                    const NFT_ADDRESS = process.env.REACT_APP_NFT_CONTRACT_ADDRESS;
                    const NFTContract = new caver.contract(NFTABI, NFT_ADDRESS);

                });
            });

        });
    });
}

export default doBetting;