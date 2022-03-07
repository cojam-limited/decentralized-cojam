import { getDataFetcher, putDataFetcher } from '@utils/fetcher';

// API URL
const URL_GET = 'ipfs/getMasterNftMetadata?menu_no=';
const URL_PUT = 'ipfs/setMintedMasterNft?cid=';

/*
"data": {
  "cid": "QmWqq6JPYBtky3DCnprRFDmgknVM4TqW6SFKxif4M5LrC3",
  "metaData": "https://metadata-store.klaytnapi.com/77718fb9-7531-420c-e42a-f60ae0d95cda/18994115-b19d-677d-7e19-13071bac8440.json"
}
*/
export const getMasterNftMetadataFetcher = async (menu_no) => {
  const res = await getDataFetcher(URL_GET + menu_no);
  if (res && res.data) {
    return res.data;
  }
};

export const updateMintedMasterNft = async (cid) => {
  const res = await putDataFetcher(URL_PUT + cid);
  if (res && res.data) {
    return res.data;
  }
};
