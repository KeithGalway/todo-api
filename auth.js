const { timingSafeEqual } = require('node:crypto')

function isValidToken(suppliedToken, expectedToken) {
    const supplied = Buffer.from(suppliedToken)
    const expected = Buffer.from(expectedToken)
    return expected.length >= 32 && supplied.length === expected.length && timingSafeEqual(supplied, expected)
}

function requireApiToken(req, res, next) {
    const authorization = req.get('authorization') || ''
    const suppliedToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''

    if (!isValidToken(suppliedToken, process.env.TODO_API_TOKEN || '')) {
        return res.status(401).json({ error: 'A valid bearer token is required.' })
    }

    next()
}

module.exports = { requireApiToken }
