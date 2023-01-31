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