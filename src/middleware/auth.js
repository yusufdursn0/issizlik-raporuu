const jwt = require('jsonwebtoken');


function auth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Yetkisiz: Token yok' });


    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: payload.id };
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Yetkisiz: Token geçersiz' });
    }
}


module.exports = auth;