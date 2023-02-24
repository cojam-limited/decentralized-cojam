import { client } from "../../../../sanity";
import toastNotify from '@utils/toast';

export const callDetailQuery = (questId, governanceId, setItem, setVoteList, setLoading, setNotData) => {
  setLoading(true);
  if(!questId) {
    toastNotify({
      state: 'error',
      message: 'error. pick the quest again. please',
    });

    setLoading(false);
    return;
  }

  const governanceItemQuery = `*[_type == 'governanceItem' && references('${questId}') && _id != '${Date.now()}']
  {
    ...,
    'quest': *[_type == 'quests' && _id == ^.questKey._ref && _id != '${Date.now()}'][0]{
      ...,
      'answerId': *[_type == 'questAnswerList' && questKey == ^.questKey && _id != '${Date.now()}'] {title, _id, totalVotes, questAnswerKey}
    },
  }`;
  client.fetch(governanceItemQuery).then((item) => {
    setNotData(false)
    setItem(item[0]);
  })
  
  const answerListQuery = `*[_type == 'governanceItemVote' && governanceItemId == '${governanceId}' && _id != '${Date.now()}']| order(_updatedAt desc)[0..4]`
  client.fetch(answerListQuery).then((answer) => {
    // console.log(answer)
    answer.map((data) => {
      console.log(data._updatedAt)
    })
    setVoteList(answer);
    setLoading(false);
  })
}

export const callDetailListQuery = (governanceId, setVoteList, setLoading, lastUpdatedAt, lastId, setNotData) => {
  setLoading(true);

  if(lastUpdatedAt !== null && lastId !== null) {
    const answerListQuery =
      `*[
          _type == 'governanceItemVote' &&
          governanceItemId == '${governanceId}' &&
          (
            dateTime(_updatedAt) < dateTime('${lastUpdatedAt}') ||
            (dateTime(_updatedAt) == dateTime('${lastUpdatedAt}') && _id > '${lastId}')
          ) &&
          _id != '${Date.now()}'
        ]| order(_updatedAt desc)[0..4]`
    client.fetch(answerListQuery).then((answer) => {
      answer.map((data) => {
        console.log('add :', data._updatedAt)
      })
      if(answer.length < 5) {
        setNotData(true)
      }
      setVoteList(prev => {
        return [...prev, ...answer]
      });
      setLoading(false);
    })
  }
}