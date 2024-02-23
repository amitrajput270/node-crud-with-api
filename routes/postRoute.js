import { Router } from "express";
import { param } from "express-validator";
import Controllers from "../Controllers/PostController.js";
import Validation from "../validation.js";

const router = Router({ strict: true });

router.get("/", Controllers.post_list);
router.get("/create", Controllers.createPost);
router.get(
    "/edit/:id",
    param("id").exists().isNumeric().toInt(),
    Validation.validate,
    Controllers.editPost
);
router.get(
    "/post/:id",
    [param("id").exists().isNumeric().toInt()],
    Controllers.singlePost
);
router.get(
    "/delete/:id",
    [param("id").exists().isNumeric().toInt()],
    Controllers.deletePost
);

router.post(
    "/create",
    Validation.default(["title", "author", "content"]),
    Validation.validate,
    Controllers.insertPost
);
router.post(
    "/edit/:id",
    [
        param("id").exists().isNumeric().toInt(),
        ...Validation.default(["title", "author", "content"]),
    ],
    Validation.validate,
    Controllers.updatePost
);

export default router;