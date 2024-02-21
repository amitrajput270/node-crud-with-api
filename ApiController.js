import { validationResult, matchedData } from "express-validator";
import DB from "./database.js";

const validation_result = validationResult.withDefaults({
    formatter: (error) => error.msg,
});

class Controller {
    static validation = (req, res, next) => {
        const errors = validation_result(req).mapped();
        if (Object.keys(errors).length) {
            Controller.response({
                statusCode: 'ERR',
                status: 422,
                statusAppend: 'Validation error.',
                data: errors,
            })(req, res, next);
        }
        next();
    };

    static create = async (req, res, next) => {
        const { title, body, author } = matchedData(req);
        try {
            const [result] = await DB.execute(
                "INSERT INTO `posts` (`title`,`content`,`author`) VALUES (?,?,?)",
                [title, body, author]
            );
            res.status(200).json({
                ok: 1,
                status: 200,
                message: "Post has been created successfully",
                post_id: result.insertId,
            });
        } catch (e) {
            next(e);
        }
    };

    static showPosts = async (req, res, next) => {
        try {
            let sql = "SELECT * FROM `posts`";
            if (req.params.id) {
                sql = `SELECT * FROM posts WHERE id=${req.params.id}`;
            }
            const [row] = await DB.query(sql);
            if (row.length === 0 && req.params.id) {
                Controller.response({
                    statusCode: 'ERR',
                    status: 200,
                    statusAppend: 'Invalid post ID.',
                })(req, res, next);
            }
            const post = req.params.id ? { post: row[0] } : { posts: row };
            // call response method
            Controller.response({
                statusCode: 'TXN',
                status: 200,
                statusAppend: 'Data fetched successfully.',
                data: post,
            })(req, res, next);
        } catch (e) {
            next(e);
        }
    };

    static editPosts = async (req, res, next) => {
        try {
            const data = matchedData(req);
            const [row] = await DB.query("SELECT * FROM `posts` WHERE `id`=?", [
                data.post_id,
            ]);

            if (row.length !== 1) {
                return res.json({
                    ok: 0,
                    statu: 404,
                    message: "Invalid post ID.",
                });
            }
            console.log(row, data);
            const post = row[0];
            const title = data.title || post.title;
            const content = data.body || post.content;
            const author = data.author || post.author;
            await DB.execute(
                "UPDATE `posts` SET `title`=?, `content`=?,`author`=?  WHERE `id`=?",
                [title, content, author, data.post_id]
            );
            res.json({
                ok: 1,
                status: 200,
                message: "Post Updated Successfully",
            });
        } catch (e) {
            next(e);
        }
    };

    static deletePosts = async (req, res, next) => {
        try {
            const [result] = await DB.execute(
                "DELETE FROM `posts` WHERE `id`=?",
                [req.params.id]
            );
            if (result.affectedRows) {
                return res.json({
                    ok: 1,
                    status: 200,
                    message: "Post has been deleted successfully.",
                });
            }
            res.status(404).json({
                ok: 0,
                status: 404,
                message: "Invalid post ID.",
            });
        } catch (e) {
            next(e);
        }
    };


    static response(params) {
        return (req, res, next) => {
            try {
                res.status(params.status).json({
                    statusCode: params.statusCode,
                    status: params.statusAppend,
                    data: params.data || {},
                });
            } catch (e) {
                next(e);
            }
        };
    }
}

export default Controller;