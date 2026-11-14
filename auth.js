const { getAuth } = require('@clerk/express')

function createRequireOwner(resolveAuth = getAuth) {
    return (req, res, next) => {
        const { isAuthenticated, userId } = resolveAuth(req)
        if (!isAuthenticated || !userId) {
            return res.status(401).json({ error: 'Sign-in is required.' })
        }
        if (userId !== process.env.TODO_OWNER_USER_ID) {
            return res.status(403).json({ error: 'You are not allowed to access this todo list.' })
        }
        next()
    }
}

const requireOwner = createRequireOwner()

module.exports = { createRequireOwner, requireOwner }
