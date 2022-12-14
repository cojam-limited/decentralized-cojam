// First, we must import the schema creator
import createSchema from "part:@sanity/base/schema-creator";

// Then import schema types from any plugins that might expose them
import schemaTypes from "all:part:@sanity/base/schema-type";

// We import object and document schemas
import communityList from "./communityList";
import season from "./season";
import quests from "./quests";
import questAnswerList from "./questAnswerList";
import betting from "./betting";
import seasonCategories from "./seasonCategories";
import member from "./member";
import pageImages from "./pageImages";
import transactions from "./transactions";
import marketCategories from "./marketCategories";
import resultList from "./resultList";
import loginRewardHistory from "./loginRewardHistory";
import joinRewardHistory from "./joinRewardHistory";
import rewardInfo from "./rewardInfo";
import qnaList from "./qnaList";
import popup from "./popup";
import admin from "./admin";

{/* 새로 추가한 부분 */}

// Then we give our schema to the builder and provide the result to Sanity
export default createSchema({
  // We name our schema
  name: "default",
  // Then proceed to concatenate our document type
  // to the ones provided by any plugins that are installed
  types: schemaTypes.concat([
    // The following are document types which will appear
    // in the studio.
    //bet,
    //country,
    //author,
    // When added to this list, object types can be used as
    // { type: 'typename' } in other document schemas
    //blockContent,

    season,
    quests,
    questAnswerList,
    communityList,
    resultList,
    qnaList,
    betting,
    seasonCategories,
    member,
    pageImages,
    transactions,
    marketCategories,
    loginRewardHistory,
    joinRewardHistory,
    rewardInfo,
    popup,
    admin,
  ]),
});
