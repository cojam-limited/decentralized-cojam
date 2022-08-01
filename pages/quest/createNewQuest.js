import { client } from "../../sanity";

import axios from "axios";
import cheerio from "cheerio";
import Moment from 'moment';
import toastNotify from '@utils/toast';

const fileUploadYoutube = async (youtubeId) => {
    const thumbNailArr = ['maxresdefault.jpg', 'sddefault.jpg', 'hqdefault.jpg', 'mqdefault.jpg', 'default.jpg'];

    let thumbNail;
    for(const youtubeUrl of thumbNailArr) {
        const url = `/yimage/${youtubeId}/${youtubeUrl}`;

        // url image download.
        try {
            await fetch(url).then(res => {
                if(res.ok) {
                    res.blob().then((blob) => {
                        thumbNail = new File([blob], 'jpg', {type: blob.type});
                    });
                }
            });
        } catch(e) {

        } finally {
            if(thumbNail) {
                return;
            }
        }
    }

    return thumbNail;
}

const fileUpload = async (snsUrl) => {
    const extensionArr = ["png", "jpg", "jpeg", "gif"];
    let extension = "jpg";

    for(const extensionStr of extensionArr) {
        if(snsUrl.toLowerCase().includes(`.${extensionStr}`)) {
            extension = extensionStr;
            break;
        }
    }

    let thumbNail;
    // url image download.
    try {
        await fetch(snsUrl).then(res => {
            res.blob().then((blob) => {
                thumbNail = new File([blob], extension, {type: blob.type});
            });
        });
    } catch(e) { 
        console.log('error', e);
    }

    return thumbNail;
}

async function getHTML(url) {
    try {
        return await axios({
            method: 'get',
            url: url.replace('https://www.youtube.com', '/youtube')
        });
    } catch (error) {
        console.error(error);
    }
}

const getSocialMediaCheck = async (snsUrl) => {
    const snsInfo = {};

    try {
        const url = decodeURIComponent(decodeURIComponent(snsUrl));    

        snsInfo['snsUrl'] = url;
        snsInfo['check'] = true;

        if(url.includes('youtube') || url.includes('youtu.be')) {
            snsInfo['snsType'] = 'Y';
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

        await getHTML(snsUrl).then(html => {
            if(html) {
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
            } else {
                snsInfo['check'] = false;
                return snsInfo;
            }
        })
        .catch((e) => {
            snsInfo['check'] = false;
            return snsInfo;
        });    
    } catch(error) {
        snsInfo['check'] = false;
    }

    return snsInfo;
}

const createNewQuest = async (modalValues, answers, walletData) => {
    if(!window.confirm('do you want to create new quest ?')) {
        return;
    }
    
    /*
        Default Graph line color values
        여기 있는 값들 순서대로 색을 할당 받게 됨.
        answer 수가 arr 개수를 넘어가면, 같은 색을 할당받을 수도 있음
     */
    const defaultLineColorArr = [
        { title: "Red", value: "#ef168f" },
        { title: "Purple", value: "#8950fc" },
        { title: "Gray", value: "#aca0cc" },
        { title: "Green", value: "#bdcdcb" },
        { title: "White", value: "white" },
        { title: "CornflowerBlue", value: "#6495ED" },
        { title: "Black", value: "black" },
        { title: "AnticqueWhite", value: "#FAEBD7" },
        { title: "Azure", value: "#F0FFFF" },
        { title: "Gold", value: "#FFD700" },
    ];


    // title setting
    modalValues['titleEN'] = modalValues.title?.EN?.content ?? '';
    modalValues['titleKR'] = modalValues.title?.KR?.content ?? '';
    modalValues['titleCH'] = modalValues.title?.CH?.content ?? '';

    delete modalValues.title;

    const quest = {'answers': [], ...modalValues};
    answers && answers.forEach((answer) => quest.answers.push(answer.value));

    //현재 season 정보
    const query = `*[_type == 'season' && isActive == true]`;
    await client.fetch(query).then(async (seasons) => {
        if(!seasons || seasons.length == 0) {
            toastNotify({
                state: 'error',
                message: 'season is null',
            });
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
        quest['creatorAddress'] = walletData.account;

        //파일 업로드 
        if(modalValues && modalValues.questType === 'I' && modalValues.imageFile) {
            quest['imageFile'] = modalValues.imageFile[0];
            quest['imageLink'] = modalValues.snsUrl ?? '';
        } else if(modalValues && modalValues.questType === 'S' && modalValues.snsUrl) {
            const snsInfo = await getSocialMediaCheck(modalValues.snsUrl);

            quest['imageLink'] = modalValues.snsUrl;
            quest['snsType'] = snsInfo.snsType;
            quest['snsId'] = snsInfo.snsId;
            quest['snsTitle'] = snsInfo.snsTitle;
            quest['snsDesc'] = snsInfo.snsDesc;

            if(snsInfo.check) {
                let thumbnail;

                // youtube 일 경우, 썸네일 저장 
                if(snsInfo.snsType === 'Y') {
                    thumbnail = await fileUploadYoutube(snsInfo.snsId);

                    if(thumbnail) {
                        quest['imageFile'] = thumbnail;
                        quest['imageUrl'] = '';
                    } else {
                        quest['imageUrl'] = `https://img.youtube.com/vi/${snsInfo.snsId}/maxresdefault.jpg`;
                    }
                } else if (snsInfo.imageUrl && snsInfo.imageUrl !== '') {
                    thumbnail = await fileUpload(modalValues.snsUrl);

                    if(thumbnail) {
                        quest['imageFile'] = thumbnail;
                        quest['imageUrl'] = '';
                    } else {
                        quest['imageUrl'] = modalValues.snsUrl;
                    }
                }
            }
        } else {
            toastNotify({
                state: 'error',
                message: 'quest create failed. snsUrl wrong.'
            });
            return;
        }

        quest['_type'] = 'quests'; 
        quest['questStatus'] = 'ONGOING';
        quest['completed'] = false;
        quest['hot'] = false;
        quest['pending'] = false;
        quest['isActive'] = true;
        quest['totalAmount'] = 0;
        quest['createdDateTime'] = Moment().format("yyyy-MM-DD HH:mm:ss");
        quest['endDateTime'] = modalValues.endDateTime;

        await client.fetch(`count(*[_type == "quests"  && _createdAt > '${Moment().format("yyyy-MM-DD")}' && _id != '${Date.now()}'])`).then(async (numOfQuestByDay) => {
            quest['questKey'] = Number( Moment().format("yyyyMMDD") + String(numOfQuestByDay + 1).padStart(8, '0') );

            // create new quest
            await client.create(quest).then(async (res) => {
                if(quest.imageFile) {
                    // upload image
                    await client.assets.upload('image', quest.imageFile).then(async (imageAsset) => {
                        await client.patch(res._id)
                                    .set({
                                        imageFile: {
                                            _type: 'image',
                                            asset: {
                                                _type: "reference",
                                                _ref: imageAsset._id
                                            }
                                        }
                                    })
                                    .commit();
                    })
                    .catch((err) => {
                        toastNotify({
                            state: 'error',
                            message: 'quest create failed. image upload failed.'
                        });

                        return { statusCode: 400 } 
                    });
                }

                // Answer 생성
                if(answers) {
                    // get increment by day
                    await client.fetch(`count(*[_type == "questAnswerList" && _createdAt > '${Moment().format("yyyy-MM-DD")}' && _id != '${Date.now()}'])`).then((numOfAnswerByDay) => {
                        order = Number( Moment().format("yyyyMMDD") + String(numOfAnswerByDay + 1).padStart(8, '0') );

                        // create new quest answer
                        answers.forEach(async (answer, index) => {
                            order = order + 1;
                            
                            const arrIndex = index % defaultLineColorArr.length;
                            const questAnswer = {
                                _type: 'questAnswerList',
                                questAnswerKey: order,
                                questKey: quest.questKey,
                                questExample: '',
                                title: answer.value,
                                totalAmount: 0,
                                userCnt: 0,
                                color: defaultLineColorArr[arrIndex]
                            }

                            await client.create(questAnswer);
                        });
                    });
                }

                toastNotify({
                    state: 'success',
                    message: 'create quest success',
                });
            });
        });
    });
}

export default createNewQuest;