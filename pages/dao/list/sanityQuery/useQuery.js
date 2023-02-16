import { client } from "../../../../sanity";

const amdinContractAddress = '0x867385AcD7171A18CBd6CB1ddc4dc1c80ba5fD52';

export const callQuestQuery = async (setListData, setLoading, activeCategory) => {
  setLoading(true);
  const accounts = await window.klaytn.enable()
  const account = accounts[0];

  const governanceDraftQuery = `*[_type == 'governanceItem' && level == '${activeCategory}' && _id != '${Date.now()}'] | order(${activeCategory}EndTime)[0..1]
  {
    ...,
    'quest': *[_type == 'quests' && _id == ^.questKey._ref && _id != '${Date.now()}'][0]{
      ...,
      'answerId': *[_type == 'questAnswerList' && questKey == ^.questKey && _id != '${Date.now()}'] {title, _id, totalVotes, questAnswerKey},
      'votingList': *[_type == 'governanceItemVote' && governanceItemId == ^._id && voter == '${account}' && _id != '${Date.now()}']
    },
  }`;
  client.fetch(governanceDraftQuery).then((governanceItem) => {
    console.log('governance', governanceItem)
    setListData(governanceItem);
    setLoading(false);
    console.log('rendering!')
  });
}

export const callQuestListQuery = async (setListData, setLoading, activeCategory, lastEndAt, lastId) => {
  console.log('End', lastEndAt)
  console.log('Id', lastId)
  console.log(activeCategory)
  setLoading(true);
  const accounts = await window.klaytn.enable()
  const account = accounts[0];

  if(lastEndAt !== null && lastId !== null) {
    const governanceQuery = `*[
      _type == 'governanceItem' &&
      level == '${activeCategory}' &&
      (
        dateTime(${activeCategory}EndTime) > dateTime('${lastEndAt}') ||
        (dateTime(${activeCategory}EndTime) == dateTime('${lastEndAt}') && _id > '${lastId}')
      )] | order(${activeCategory}EndTime)[0..2]
    {
      ...,
      'quest': *[_type == 'quests' && _id == ^.questKey._ref && _id != '${Date.now()}'][0]{
        ...,
        'answerId': *[_type == 'questAnswerList' && questKey == ^.questKey && _id != '${Date.now()}'] {title, _id, totalVotes, questAnswerKey},
        'votingList': *[_type == 'governanceItemVote' && governanceItemId == ^._id && voter == '${account}' && _id != '${Date.now()}']
      },
    }`;
    console.log(governanceQuery);
    client.fetch(governanceQuery).then((governanceItem) => {
      console.log('new governance', governanceItem)
      setListData(prev => {
        return [...prev, ...governanceItem]
      });
      setLoading(false);
      console.log('rendering!')
    });
  }
}

export const callAdminQuery = async (setAdminAddressDB) => {
  const AdminAddressQuery = `*[_type == 'admin' && active == true && _id != '${Date.now()}']`
  client.fetch(AdminAddressQuery).then((adminlist) => {
    adminlist.map((admin) => {
      if(admin.walletAddress.toLowerCase() === amdinContractAddress.toLowerCase()) {
        setAdminAddressDB(admin.walletAddress);
      }
    })
  })
}