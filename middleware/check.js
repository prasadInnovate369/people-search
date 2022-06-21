const whitelist = ['localhost:3000', 'localhost:3001']

const checkWhiteList = (req, res, next) => {
  if (whitelist.indexOf(req.headers.host) !== -1) {
    next()
  } else {
    res.send('Access forbidden!')
  }
}

module.exports = checkWhiteList;
