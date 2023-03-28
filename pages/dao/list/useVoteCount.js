import { GovernanceContract } from "../contractHelper";

export const voteCount = async () => {
  const minVote = await GovernanceContract().methods.getMinTotalVote().call()
  const maxVote = await GovernanceContract().methods.getMaxTotalVote().call()
  return { minVote: minVote, maxVote: maxVote }
}