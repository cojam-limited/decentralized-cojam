import { client } from "../../../../sanity";

export const callRewardQuery = async (setDataList, setLoading, setNotData) => {
  setLoading(true);

  const accounts = await window.klaytn.enable()
  const account = accounts[0];

  const rewardHistoryQuery = `*[_type == 'governanceItemVote' && archive == true && voter == '${account}' && governanceItemId in *[_type == 'governanceItem' && level == 'done' && reward != null]._id]| order(_updatedAt asc)[0..1]
  {
    ...,
    'governanceItem' : *[_type == 'governanceItem' && _id == ^.governanceItemId] 
    {
      ...,
      'quest': *[_type == 'quests' && _id == ^.questKey._ref && _id != '${Date.now()}'][0]{
        ...,
        'answerId': *[_type == 'questAnswerList' && questKey == ^.questKey && _id != '${Date.now()}'] {title, _id, totalVotes, questAnswerKey},
      }
    }
  }`;
  client.fetch(rewardHistoryQuery).then((reward) => {
    console.log('FIRST', reward)
    setNotData(false);
    setDataList(reward);
    setLoading(false);
  });
}

export const callRewardListQuery = async (setDataList, setLoading, setNotData, lastValue, lastId) => {
  setLoading(true);

  const accounts = await window.klaytn.enable()
  const account = accounts[0];

  if(lastValue !== null && lastId !== null) {
    const rewardHistoryQuery = `*[
      _type == 'governanceItemVote' &&
      archive == true &&
      voter == '${account}' &&
      (
        dateTime(_updatedAt) > dateTime('${lastValue}') ||
        (dateTime(_updatedAt) == dateTime('${lastValue}') && _id < '${lastId}')
      ) &&
      governanceItemId in *[_type == 'governanceItem' && level == 'done' && reward != null]._id] [0..1]| order(_updatedAt asc)
    {
      ...,
      'governanceItem' : *[_type == 'governanceItem' && _id == ^.governanceItemId] 
      {
        ...,
        'quest': *[_type == 'quests' && _id == ^.questKey._ref && _id != '${Date.now()}'][0]{
          ...,
          'answerId': *[_type == 'questAnswerList' && questKey == ^.questKey && _id != '${Date.now()}'] {title, _id, totalVotes, questAnswerKey},
        }
      }
    }`;
    client.fetch(rewardHistoryQuery).then((reward) => {
      console.log('ADD', reward)
      if(reward.length === 0) {
        setNotData(true);
        setLoading(false);
      }
      setDataList(prev => {
        return [...prev, ...reward]
      })
      setLoading(false);
    });
  }
}