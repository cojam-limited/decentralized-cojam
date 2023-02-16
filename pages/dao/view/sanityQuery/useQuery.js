import { client } from "../../../../sanity";
import toastNotify from '@utils/toast';

export const callDetailQuery = (questId, setItem, setVoteList, setLoading, setNotData) => {
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
  
  const answerListQuery = `*[_type == 'governanceItemVote' && governanceItemId == '${questId}' && _id != '${Date.now()}'][0..4]`
  client.fetch(answerListQuery).then((answer) => {
    console.log(answer)
    setVoteList(answer);
    setLoading(false);
  })
}

export const callDetailListQuery = (questId, setVoteList, setLoading, lastCreatedAt, lastId, setNotData) => {
  setLoading(true);

  if(lastCreatedAt !== null && lastId !== null) {
    const answerListQuery =
      `*[
          _type == 'governanceItemVote' &&
          governanceItemId == '${questId}' &&
          (
            dateTime(_createdAt) < dateTime('${lastCreatedAt}') ||
            (dateTime(_createdAt) == dateTime('${lastCreatedAt}') && _id > '${lastId}')
          ) &&
          _id != '${Date.now()}'
        ][0..4]`
    client.fetch(answerListQuery).then((answer) => {
      console.log(answer)
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