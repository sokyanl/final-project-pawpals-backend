export function validatorPet(input) {
    const validationErrors = {};

    if(!("pet_breed" in input) || input["pet_breed"].length == 0) {
        validationErrors["pet_breed"] = "cannot be blank";
    }

    if(!("pet_colour" in input) || input["pet_colour"].length == 0) {
        validationErrors["pet_colour"] = "cannot be blank";
    }
    
    if(!("pet_description" in input) || input["pet_description"].length == 0) {
        validationErrors["pet_description"] = "cannot be blank";
    }

    if(!("pet_location" in input) || input["pet_location"].length == 0) {
        validationErrors["pet_location"] = "cannot be blank";
    }

    return validationErrors;
}