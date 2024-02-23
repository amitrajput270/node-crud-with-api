import DB from "../dbConnection.js";

class Controllers {
    static createPost = (req, res) => {
        res.render("create-post");
    };

    static post_list = async (req, res, next) => {
        try {
            const [row] = await DB.query("SELECT * FROM `posts`");
            res.render("post-list", {
                posts: row,
            });
        } catch (e) {
            next(e);
        }
    };

    static insertPost = async (req, res, next) => {
        if (res.locals.validationError !== undefined) {
            return res.render("create-post", {
                validationErrors: JSON.stringify(
                    res.locals.validationError.errors
                ),
                body: req.body,
            });
        }
        const { title, content, author } = req.body;
        try {
            await DB.execute(
                "INSERT INTO `posts` (`title`,`content`,`author`) VALUES (?,?,?)",
                [title, content, author]
            );
            res.redirect("/");
        } catch (e) {
            next(e);
        }
    };

    static editPost = async (req, res, next) => {
        if (res.locals.validationError !== undefined) {
            return res.redirect("/");
        }
        try {
            const [row] = await DB.query("SELECT * FROM `posts` WHERE `id`=?", [
                req.params.id,
            ]);
            if (Object.keys(row).length === 0) {
                return res.redirect("/");
            }
            res.render("edit-post", {
                post: Object.values(row)[0],
            });
        } catch (e) {
            next(e);
        }
    };

    static updatePost = async (req, res, next) => {
        if (isNaN(+req.params.id)) {
            return res.redirect("/");
        }
        try {
            const [row] = await DB.execute(
                "SELECT * FROM `posts` WHERE `id`=?",
                [req.params.id]
            );
            if (Object.keys(row).length === 0) {
                return res.redirect("/");
            }
            if (res.locals.validationError !== undefined) {
                return res.render("edit-post", {
                    validationErrors: JSON.stringify(
                        res.locals.validationError.errors
                    ),
                    body: req.body,
                    post: Object.values(row)[0],
                });
            }
            const { title, content, author } = req.body;
            await DB.execute(
                "UPDATE `posts` SET `title`=?, `content`=?,`author`=? WHERE `id`=?",
                [title, content, author, req.params.id]
            );
            res.redirect("/");
            // res.render("edit-post", {
            //     body: req.body,
            //     updated: 1,
            // });
        } catch (e) {
            next(e);
        }
    };

    static deletePost = async (req, res, next) => {
        if (isNaN(+req.params.id)) {
            return res.redirect("/");
        }
        await DB.execute("DELETE FROM `posts` WHERE `id`=?", [req.params.id]);
        return res.redirect("/");
    };

    static singlePost = async (req, res, next) => {
        if (isNaN(+req.params.id)) {
            return res.redirect("/");
        }
        try {
            const [row] = await DB.query("SELECT * FROM `posts` WHERE `id`=?", [
                req.params.id,
            ]);
            if (Object.keys(row).length === 0) {
                return res.redirect("/");
            }
            res.render("view", {
                post: Object.values(row)[0],
            });
        } catch (e) {
            next(e);
        }
    };
}

export default Controllers;
