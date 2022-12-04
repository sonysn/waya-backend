exports.userDriverSignupValidator = (req, res, next) => {

    //first name and last name not null
    req.check('firstname', "First name is required!").notEmpty();
    req.check('lastname', "Last name is required!").notEmpty();

    //password also checks for password
    req.check('password', "Password is required").notEmpty();

    //check if phone number is null
    req.check('phoneNumber', "Phone number is required!").notEmpty();

    //check if email is null
    req.check('email', "Email is required!").notEmpty();

    //check if Address is null
    req.check('address', "Address is required!").notEmpty();

    //check if dob is null
    req.check('dob', "Date of Birth is required!").notEmpty();

    //check if profilePhoto is null
    req.check('profilePhoto', "Your profile is required!").notEmpty();

    //check if Means of ID is null
    req.check('meansofID', "Means of ID is required!").notEmpty();

    //check for errors
    const errors = req.validationErrors();
    //show first errors as they happen
    if (errors) {
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }
    //proceed to next middleware
    next();
}