const result = (state, msg) => {
    return {
        state: state,
        message: msg,
    }
}

export function validateOption(options) {
    if (!Array.isArray(options)) {
        return result('error', 'options type is not array..');
    }
    if(!options.length > 2) return result('error', 'number of options should be over 2..')

    options.forEach((value, index) => {
        if(typeof value !== 'string') return result('error', `option${index} is not string..`);
        if(value === "") return result('error', `option${index} is empty`)
        if(value.length > 20) return result('error', `option${index} is too long.. make characters under 20`)
        if(!value.trim().length) return result('error',`option${index} is only space..`);
    })
    //todo : add the number of characters restrict if you need
}

export function validateTitle(title) {
    if (typeof title !== 'string') {
        return result('error', 'title type is not string..');
    }
    if (title === "") {
        return result('error', 'title is empty..')
    }
    if (title.length > 50) {
        return result('error', 'title is too long.. make characters under 50');
    }
    if (!title.trim().length) {
        return result('error', 'title has only space..')
    }
}

export function validateDescr(descr) {
    if (typeof descr !== 'string') {
        return result('error', 'description type is not string..');
    }
    if (descr === "") {
        return result('error', 'description is empty..')
    }
    if (!descr.trim().length) {
        return result('error', 'description has only space..')
    }
    //todo : add the number of characters restrict if you need
}