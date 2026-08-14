/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
    console.error(err);

    if (err.code === '23505') {
        // Postgres unique_violation
        return res.status(409).json({ error: 'That value already exists.' });
    }

    const status = err.status || 500;
    const message = err.message || 'Something went wrong on our end.';
    res.status(status).json({ error: message });
}

module.exports = errorHandler;
