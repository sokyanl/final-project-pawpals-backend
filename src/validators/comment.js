export function validateComment(input) {
    const validationErrors = {};

    if (!('content' in input) || input['content'].length == 0) {
        validationErrors['content'] = 'cannot be blank'
    }

    return validationErrors;
}