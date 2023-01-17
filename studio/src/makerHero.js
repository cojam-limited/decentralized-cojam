import { client } from "../../sanity";
import Moment from 'moment';

export const keyMaker = async (schema) => {
    const count = await client.fetch(`count(*[_type == "${schema}"  && _createdAt > '${Moment().format("yyyy-MM-DD")}' && _id != '${Date.now()}'])`)
    return Number(Moment().format("yyyyMMDD") + String(count + 1).padStart(8, '0'));
}

export const setEndTime = (day) => {
    let currentDate = new Date();
    currentDate.setUTCDate(currentDate.getUTCDate() + day);
    return currentDate.toISOString();
}