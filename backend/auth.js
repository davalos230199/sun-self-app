const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Token requerido' });

  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido' });
  }
}

module.exports = authMiddleware;
