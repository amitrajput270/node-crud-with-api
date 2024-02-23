
export const sendApiResponse = (params) => {
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






