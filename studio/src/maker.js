import { client } from "../../sanity";
import Moment from 'moment';

/**
 * pass schema name that you want to create key as YYYYMMDDxxxxxxxx
 * @param {string} schema
 * @returns {number} key
 */
export const keyMaker = async (schema) => {
    const count = await client.fetch(`count(*[_type == "${schema}"  && _createdAt > '${Moment().format("yyyy-MM-DD")}' && _id != '${Date.now()}'])`)
    return Number(Moment().format("yyyyMMDD") + String(count + 1).padStart(8, '0'));
}
/**
 * pass number which end time will be now + xDay
 * @param {number} day
 * @returns {string} date
 */
export const setEndTime = (day) => {
    let currentDate = new Date();
    currentDate.setUTCDate(currentDate.getUTCDate() + day);
    return currentDate.toISOString();
}
/**
 * GROQ pagination arr should be contained data from sanity  ex) _id, _createdAt ...
 * @param {string} arr
 * @returns {null|string} lastId, lastValue
 */
export const lastElementsForPage = (arr , value) => {
    let lastId = ''
    let lastValue =''
    if (arr.length > 0) {
        lastId = arr[arr.length - 1]._id
        lastValue = arr[arr.length -1][value]
      } else {
        lastId = null // Reached the end
        lastValue = null
      }
      return {lastId, lastValue}
}
/**
 * Compare given two arrays and return unduplicated elements as new array
 * @param {*} arr1
 * @param {*} arr2
 * @returns {*} newArray
 */
export const uniqueElementsBetweenArr = (arr1, arr2) => {
  return arr1.filter(function(element) {
    return arr2.indexOf(element) === -1;
  });
}