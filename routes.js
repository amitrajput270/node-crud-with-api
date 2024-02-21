import { Router } from "express";
import { param } from "express-validator";
import Controllers from "./controllers.js";
import Validation from "./validation.js";

const router = Router({ strict: true });

router.get("/", Controllers.post_list);
router.get("/create", Controllers.create_post);
router.get(
    "/edit/:id",
    param("id").exists().isNumeric().toInt(),
    Validation.validate,
    Controllers.edit_post
);
router.get(
    "/post/:id",
    [param("id").exists().isNumeric().toInt()],
    Controllers.single_post
);
router.get(
    "/delete/:id",
    [param("id").exists().isNumeric().toInt()],
    Controllers.delete_post
);

router.post(
    "/create",
    Validation.default(["title", "author", "content"]),
    Validation.validate,
    Controllers.insert_post
);
router.post(
    "/edit/:id",
    [
        param("id").exists().isNumeric().toInt(),
        ...Validation.default(["title", "author", "content"]),
    ],
    Validation.validate,
    Controllers.update_post
);

export default router;