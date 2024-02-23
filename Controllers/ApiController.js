import { validationResult, matchedData } from "express-validator";
import DB from "../dbConnection.js";
import { sendApiResponse } from '../helpers/helper.js';


const validation_result = validationResult.withDefaults({
    formatter: (error) => error.msg,
});

class Controller {
    static validation = (req, res, next) => {
        const errors = validation_result(req).mapped();
        if (Object.keys(errors).length) {
            return res.status(422).json({
                statusCode: 'ERR',
                status: 'Validation Error.',
                data: errors,
            });
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
            sendApiResponse({
                statusCode: 'TXN',
                status: 201,
                statusAppend: 'Post has been created successfully.',
                data: { id: result.insertId, title, body, author },
            })(req, res, next);
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
                sendApiResponse({
                    statusCode: 'ERR',
                    status: 200,
                    statusAppend: 'Invalid post ID.',
                })(req, res, next);
            }
            const post = req.params.id ? { post: row[0] } : { posts: row };
            // call response method
            sendApiResponse({
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
                data.id,
            ]);
            if (row.length !== 1) {
                sendApiResponse({
                    statusCode: 'ERR',
                    status: 200,
                    statusAppend: 'Invalid post ID.',
                    data: data,
                })(req, res, next);
            }
            const post = row[0];
            const title = data.title || post.title;
            const content = data.body || post.content;
            const author = data.author || post.author;
            await DB.execute(
                "UPDATE `posts` SET `title`=?, `content`=?,`author`=?  WHERE `id`=?",
                [title, content, author, data.id]
            );
            sendApiResponse({
                statusCode: 'TXN',
                status: 200,
                statusAppend: 'Post has been updated successfully.',
                data: data
            })(req, res, next);
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
                sendApiResponse({
                    statusCode: 'TXN',
                    status: 200,
                    statusAppend: 'Post has been deleted successfully.',
                })(req, res, next);
            }
            sendApiResponse({
                statusCode: 'ERR',
                status: 200,
                statusAppend: 'Invalid post ID.',
            })(req, res, next);
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