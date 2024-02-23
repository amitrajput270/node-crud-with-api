import { Router } from "express";
import { body, param, header } from "express-validator";
import Controller from "../Controllers/ApiController.js";
import { verifyToken } from '../tokenHandler.js';

const routes = Router({ strict: true });

// Token Validation Rule
const tokenValidation = (isRefresh = false) => {
    let refreshText = isRefresh ? 'Refresh' : 'Authorization';
    return [
        header('Authorization', `Please provide your ${refreshText} token`)
            .exists()
            .not()
            .isEmpty()
            .custom((value, { req }) => {
                if (!value.startsWith('Bearer') || !value.split(' ')[1]) {
                    throw new Error(`Invalid ${refreshText} token`);
                }
                if (isRefresh) {
                    req.headers.refresh_token = value.split(' ')[1];
                    return true;
                }
                req.headers.access_token = value.split(' ')[1];
                return true;
            }),
    ];
};

const verifyTokenMiddleware = () => {
    return async (req, res, next) => {
        try {
            const token = req.headers.access_token;
            const data = verifyToken(token);
            if (data?.status) return res.status(data.status).json(data);
            req.user = data;
            next();
        } catch (err) {
            next(err);
        }
    };
}


// Create Data
routes.post(
    "/post",
    [
        body("title", "").trim().not().isEmpty().escape(),
        body("body", "Must not be empty.").trim().not().isEmpty().escape(),
        body("author", "Must not be empty.").trim().not().isEmpty().escape(),
    ],
    tokenValidation(),
    verifyTokenMiddleware(),
    Controller.validation,
    Controller.create
);

// Read Data
routes.get("/posts", tokenValidation(), verifyTokenMiddleware(), Controller.showPosts);
routes.get(
    "/post/:id",
    [param("id", "Invalid post ID.").exists().isNumeric().toInt()],
    tokenValidation(),
    verifyTokenMiddleware(),
    Controller.validation,
    Controller.showPosts
);

// Update Data
routes.patch(
    "/post/:id",
    [param("id", "Invalid post ID.")
        .exists()
        .isNumeric()
        .toInt()
    ],
    [
        body("title", "Must not be empty.")
            .optional()
            .trim()
            .not()
            .isEmpty()
            .escape(),
        body("body", "Must not be empty.")
            .optional()
            .trim()
            .not()
            .isEmpty()
            .escape(),
        body("author", "Must not be empty.")
            .optional()
            .trim()
            .not()
            .isEmpty()
            .escape(),
    ],
    tokenValidation(),
    verifyTokenMiddleware(),
    Controller.validation,
    Controller.editPosts
);

// Delete Data
routes.delete(
    "/post/:id",
    [param("id", "Invalid post ID.").exists().isNumeric().toInt()],
    tokenValidation(),
    verifyTokenMiddleware(),
    Controller.validation,
    Controller.deletePosts
);

export default routes;