exports.userSignupValidator = (req, res, next) => {

    //first name and last name not null
    req.check('firstname', "First name is required!").notEmpty();
    req.check('lastname', "Last name is required!").notEmpty();

    //password also checks for password
    req.check('password', "Password is required").notEmpty();

    //check if phone number is null
    req.check('phoneNumber', "Phone number is required!").notEmpty();

    //check if email is null
    req.check('email', "Email is required!").notEmpty();

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