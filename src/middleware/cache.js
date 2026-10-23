const redis = require('../config/redis');

module.exports = (ttl = 60) => async (req, res, next) => {
  const key = 'cache:' + req.originalUrl;

  try {
    const hit = await redis.get(key);
    if (hit) {
      res.set('X-Cache', 'HIT');
      return res.json(JSON.parse(hit));
    }
  } catch (e) {}

  res.set('X-Cache', 'MISS');
  const send = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode === 200) {
      redis.set(key, JSON.stringify(body), 'EX', ttl).catch(() => {});
    }
    return send(body);
  };
  next();
};