import { body, validationResult } from "express-validator";

class Validation {
    static default(fields) {
        const checks = [];
        for (let i of fields) {
            checks.push(
                body(i, `Must not be empty.`)
                    .unescape()
                    .trim()
                    .not()
                    .isEmpty()
                    .escape()
            );
        }
        return checks;
    }

    static validate = (req, res, next) => {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        res.locals.validationError = errors;
        next();
    };
}

export default Validation;