
import { client } from "../../sanity";

import axios from "axios";
import cheerio from "cheerio";

async function getHTML(url) {
    try {
        return await axios({
            method: 'get',
            url: '/watch?v=3HNyXCPDQ7Q&t=7478s'
        });
    } catch (error) {
        console.error(error);
    }
}

const getSocialMediaCheck = (snsUrl) => {
    const snsInfo = {};

    try {
        const url = decodeURIComponent(decodeURIComponent(snsUrl));    

        snsInfo['snsUrl'] = url;
        snsInfo['check'] = true;

        if(url.includes('youtube') || url.includes('youtu.be')) {
            snsInfo['snsType'] = 'Y';
            // TODO CHECK 
            const pattern = "(?<=watch\\?v=|/videos/|embed\\/|youtu.be\\/|\\/v\\/|watch\\?v%3D|%2Fvideos%2F|embed%2F|youtu.be%2F|%2Fv%2F)[^#\\&\\?\\n]*";
            const re = new RegExp(pattern);
            const youtubeId = re.exec(url) && re.exec(url)[0];

            if(!youtubeId) {
                snsInfo['check'] = false;
                return snsInfo;
            }

            snsInfo['snsId'] = youtubeId;
        } else {
            snsInfo['snsType'] = 'O';
        }

        getHTML(snsUrl).then(html => {
            let titleList = [];
            const $ = cheerio.load(html.data);
            
            const titleBody = $("meta[property=og:title]").first();
            if(titleBody && titleBody[0]) {
                snsInfo['snsTitle'] = titleBody[0].attribs.content;
            }

            const imageBody = $("meta[property=og:image]").first();
            if(imageBody && imageBody[0]) {
                snsInfo['imageUrl'] = imageBody[0].attribs.content;
            }

            const descriptionBody = $("meta[property=og:description]").first();
            if(descriptionBody && descriptionBody[0]) {
                snsInfo['snsDesc'] = descriptionBody[0].attribs.content;
            }
        })
        .catch(() => {
            snsInfo['check'] = false;
            return snsInfo;
        });    
    } catch(error) {
        snsInfo['check'] = false;
        console.log(error);
    }

    return snsInfo;
}

const createNewQuest = (modalValues, answers) => {
    if(!window.confirm('create new quest ?')) {
        return;
    }
    
    const quest = {'answers': [], ...modalValues};

    answers && answers.forEach((answer) => quest.answers.push(answer.value));

    //현재 season 정보x
    const query = `*[_type == 'season' && isActive == true]`;
    client.fetch(query).then(async (seasons) => {
        if(!seasons || seasons.length == 0) {
            return;
        }
        
        // set season info to quest
        const curSeason = seasons[0];
        quest['season'] = { _type: 'reference', _ref: curSeason._id };
        quest['cojamFee'] = curSeason.cojamFee;
        quest['charityFee'] = curSeason.charityFee;
        quest['creatorFee'] = curSeason.creatorFee;
        quest['creatorPay'] = curSeason.creatorPay;
        quest['minimumPay'] = Number(curSeason.minimumPay);
        quest['maximumPay'] = Number(curSeason.maximumPay);

        const accounts = await window.klaytn.enable();
        const walletAddress = accounts[0];
        if(!walletAddress) {
            return;
        }

        quest['creatorAddress'] = walletAddress;

        //파일 업로드 
        if(modalValues && modalValues.imageFile) {
            quest['imageFile'] = modalValues.imageFile[0];
            quest['snsUrl'] = '';
        } else if(modalValues && modalValues.snsUrl) {
            const snsInfo = getSocialMediaCheck(modalValues.snsUrl);

            if(snsInfo.check) {
                if("Y" === snsInfo.snsType) {
                    // TODO ADD  youtube video download
                } else if(snsInfo.imageUrl) {
                    // TODO ADD image download
                }
            }

            quest['snsType'] = snsInfo.snsType;
            quest['snsId'] = snsInfo.snsId;
            quest['snsTitle'] = snsInfo.snsTitle;
            quest['snsDesc'] = snsInfo.snsDesc;
        } else {
            return;
        }

        quest['_type'] = 'quests'; 
        quest['questStatus'] = 'ONGOING';
        quest['completed'] = true;
        quest['hot'] = false;
        quest['pending'] = false;
        quest['isActive'] = true;
        quest['totalAmount'] = 0;
        quest['endDateTime'] = modalValues.endDateTime;

        client.fetch(`count(*[_type == "quests"])`).then((order) => {
            quest['questKey'] = order + 1;

            // create new quest
            client.create(quest).then((res) => {
                // upload image
                client.assets
                      .upload('image', quest.imageFile)
                      .then((imageAsset) => {
                        client.patch(res._id)
                              .set({imageFile: {
                                        _type: 'image',
                                        asset: {
                                            _type: "reference",
                                            _ref: imageAsset._id
                                        }
                                    }
                              })
                              .commit();

                        console.log('Image upload Done!');
                      })
                      .catch((err) => { 
                        console.log('err', err);
                        return { statusCode: 400 } 
                      });

                // Answer 생성
                if(answers) {
                    // get increment
                    client.fetch(`count(*[_type == "questAnswerList"])`).then((order) => {
                        // create new quest answer
                        answers.forEach((answer) => {   
                            order = order + 1;
                            
                            const questAnswer = {
                                _type: 'questAnswerList',
                                questAnswerKey: order,
                                questKey: quest.questKey,
                                questExample: '',
                                title: answer.value,
                                totalAmount: 0,
                                userCnt: 0,
                            }

                            client.create(questAnswer).then((res) => {
                                
                            });
                        });
                    });
                }

                alert('create quest success');
            });
        });
    });
}

export default createNewQuest;