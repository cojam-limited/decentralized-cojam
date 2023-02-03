class ProposalCreateError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ProposalCreateError';
    }
}

export function validateOption(options) {
    if (!Array.isArray(options)) throw new ProposalCreateError('options type is not array..');
    if(!options.length >= 2) throw new ProposalCreateError('number of options should be over 2..');

    options.forEach((value, index) => {
        if(typeof value !== 'string') throw new ProposalCreateError(`option${index+1} is not string..`);
        if(value === "") throw new ProposalCreateError(`option${index+1} is empty`);
        if(value.length > 20) throw new ProposalCreateError(`Option ${index+1} must have a length of 20 characters or less.`);
        if(!value.trim().length) throw new ProposalCreateError(`option${index+1} is only space..`);
    })
    //todo : add the number of characters restrict if you need
}

export function validateTitle(title) {
    if (typeof title !== 'string') throw new ProposalCreateError('title type is not string..');
    if (title === "") throw new ProposalCreateError('title is empty..');
    if (title.length > 50) throw new ProposalCreateError('title is too long.. make characters under 50');
    if (!title.trim().length) throw new ProposalCreateError('title has only space..');
}

export function validateDescr(descr) {
    if (typeof descr !== 'string') throw new ProposalCreateError('description type is not string..');
    if (descr === "") throw new ProposalCreateError('description is empty..');
    if (!descr.trim().length) throw new ProposalCreateError('description has only space..');
    //todo : add the number of characters restrict if you need
}