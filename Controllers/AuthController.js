import bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { validationResult, matchedData } from 'express-validator';
import { generateToken, verifyToken } from '../tokenHandler.js';
import { sendApiResponse } from '../helpers/helper.js';

import DB from '../dbConnection.js';

const validation_result = validationResult.withDefaults({
    formatter: (error) => error.msg,
});

export const validate = (req, res, next) => {
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

// If email already exists in database
export const fetchUserByEmailOrID = async (data, isEmail = true) => {
    let sql = 'SELECT * FROM `users` WHERE `email`=?';
    if (!isEmail)
        sql = 'SELECT `id` ,`name`, `email` FROM `users` WHERE `id`=?';
    const [row] = await DB.execute(sql, [data]);
    return row;
};

export default {
    signup: async (req, res, next) => {
        try {
            const { name, email, password } = matchedData(req);
            const saltRounds = 10;
            // Hash the password
            const hashPassword = await bcrypt.hash(password, saltRounds);

            // Store user data in the database
            const [result] = await DB.execute(
                'INSERT INTO `users` (`name`,`email`,`password`) VALUES (?,?,?)',
                [name, email, hashPassword]
            );
            sendApiResponse({
                statusCode: 'TXN',
                status: 200,
                statusAppend: 'You have been successfully registered.',
                data: { userId: result.insertId, name, email, password },
            })(req, res, next);
        } catch (err) {
            next(err);
        }
    },

    login: async (req, res, next) => {
        try {
            const { user, password } = req.body;
            const verifyPassword = await bcrypt.compare(
                password,
                user.password
            );
            if (!verifyPassword) {
                sendApiResponse({
                    statusCode: 'ERR',
                    status: 422,
                    statusAppend: 'Incorrect password!',
                })(req, res, next);
            }

            // Generating Access and Refresh Token
            const access_token = generateToken({ id: user.id });
            const refresh_token = generateToken({ id: user.id }, false);

            const md5Refresh = createHash('md5')
                .update(refresh_token)
                .digest('hex');

            // Storing refresh token in MD5 format
            const [result] = await DB.execute(
                'INSERT INTO `refresh_tokens` (`user_id`,`token`) VALUES (?,?)',
                [user.id, md5Refresh]
            );

            if (!result.affectedRows) {
                sendApiResponse({
                    statusCode: 'ERR',
                    status: 500,
                    statusAppend: 'Failed to whitelist the refresh token.',
                })(req, res, next);
            }

            sendApiResponse({
                statusCode: 'TXN',
                status: 200,
                statusAppend: 'You have been successfully logged in.',
                data: { access_token, refresh_token },
            })(req, res, next);

        } catch (err) {
            next(err);
        }
    },

    getUser: async (req, res, next) => {
        try {
            // Verify the access token
            const data = verifyToken(req.headers.access_token);
            if (data?.status) return res.status(data.status).json(data);
            // fetching user by the `id` (column)
            const user = await fetchUserByEmailOrID(data.id, false);
            if (user.length !== 1) {
                sendApiResponse({
                    statusCode: 'ERR',
                    status: 200,
                    statusAppend: 'User not found.',
                })(req, res, next);
            }
            sendApiResponse({
                statusCode: 'TXN',
                status: 200,
                statusAppend: 'User data has been fetched.',
                data: user[0],
            })(req, res, next);
        } catch (err) {
            next(err);
        }
    },

    refreshToken: async (req, res, next) => {
        try {
            const refreshToken = req.headers.refresh_token;
            // Verify the refresh token
            const data = verifyToken(refreshToken, false);
            if (data?.status) return res.status(data.status).json(data);

            // Converting refresh token to md5 format
            const md5Refresh = createHash('md5')
                .update(refreshToken)
                .digest('hex');

            // Finding the refresh token in the database
            const [refTokenRow] = await DB.execute(
                'SELECT * from `refresh_tokens` WHERE token=?',
                [md5Refresh]
            );

            if (refTokenRow.length !== 1) {
                sendApiResponse({
                    statusCode: 'ERR',
                    status: 401,
                    statusAppend: 'Unauthorized: Invalid Refresh Token.',
                })(req, res, next);
            }

            // Generating new access and refresh token
            const access_token = generateToken({ id: data.id });
            const refresh_token = generateToken({ id: data.id }, false);

            const newMd5Refresh = createHash('md5')
                .update(refresh_token)
                .digest('hex');

            // Replacing the old refresh token to new refresh token
            const [result] = await DB.execute(
                'UPDATE `refresh_tokens` SET `token`=? WHERE `token`=?',
                [newMd5Refresh, md5Refresh]
            );

            if (!result.affectedRows) {
                sendApiResponse({
                    statusCode: 'ERR',
                    status: 500,
                    statusAppend: 'Failed to whitelist the Refresh token.',
                })(req, res, next);
            }
            sendApiResponse({
                statusCode: 'TXN',
                status: 200,
                statusAppend: 'Token has been refreshed.',
                data: { access_token, refresh_token },
            })(req, res, next);
        } catch (err) {
            next(err);
        }
    },
};