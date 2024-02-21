import { Router } from "express";
import { body, param } from "express-validator";
import Controller from "./ApiController.js";

const routes = Router({ strict: true });

// Create Data
routes.post(
    "/create",
    [
        body("title", "").trim().not().isEmpty().escape(),
        body("body", "Must not be empty.").trim().not().isEmpty().escape(),
        body("author", "Must not be empty.").trim().not().isEmpty().escape(),
    ],
    Controller.validation,
    Controller.create
);

// Read Data
routes.get("/posts", Controller.showPosts);
routes.get(
    "/post/:id",
    [param("id", "Invalid post ID.").exists().isNumeric().toInt()],
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
    Controller.validation,
    Controller.editPosts
);

// Delete Data
routes.delete(
    "/post/:id",
    [param("id", "Invalid post ID.").exists().isNumeric().toInt()],
    Controller.validation,
    Controller.deletePosts
);

export default routes;