import { client } from "../../sanity";
import toastNotify from '@utils/toast';

/*
    params is object which contain requirements for GROQ query
    ex ) schema, name, id, key ...
*/

export const isUniqueKey = async (params) => {
    const existing = await client.fetch(`*[_type == '${params.schema}' && !(_id in path("drafts.**")) && ${params.name} == '${params.id}' && voter == '${params.voter}']`);
    if(existing.length > 0) {
        toastNotify({
            state: 'error',
            message: 'already exist voter',
        });
    }
}

export const isExistingRef = async (params) => {
    const existing = await client.fetch(`*[_type == '${params.schema}' && !(_id in path("drafts.**")) && ${params.name}._ref == "${params.key}"]`);
    if(existing.length > 0) {
        toastNotify({
            state: 'error',
            message: 'already exist data',
        });
    }
}