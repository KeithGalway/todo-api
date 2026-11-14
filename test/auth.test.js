const assert = require('node:assert/strict')
const test = require('node:test')
const { createRequireOwner } = require('../auth')

function runMiddleware(auth, ownerUserId = 'owner') {
    let statusCode
    let responseBody
    let continued = false
    const previousOwnerId = process.env.TODO_OWNER_USER_ID
    process.env.TODO_OWNER_USER_ID = ownerUserId
    const req = {}
    const res = {
        status(code) {
            statusCode = code
            return this
        },
        json(body) {
            responseBody = body
            return this
        }
    }

    try {
        createRequireOwner(() => auth)(req, res, () => { continued = true })
    } finally {
        if (previousOwnerId === undefined) delete process.env.TODO_OWNER_USER_ID
        else process.env.TODO_OWNER_USER_ID = previousOwnerId
    }
    return { statusCode, responseBody, continued }
}

test('rejects unauthenticated requests', () => {
    const result = runMiddleware({ isAuthenticated: false, userId: null })
    assert.equal(result.statusCode, 401)
    assert.equal(result.responseBody.error, 'Sign-in is required.')
    assert.equal(result.continued, false)
})

test('rejects signed-in users other than the configured owner', () => {
    const result = runMiddleware({ isAuthenticated: true, userId: 'another-user' })
    assert.equal(result.statusCode, 403)
    assert.equal(result.responseBody.error, 'You are not allowed to access this todo list.')
    assert.equal(result.continued, false)
})

test('allows the configured owner', () => {
    const result = runMiddleware({ isAuthenticated: true, userId: 'owner' })
    assert.equal(result.statusCode, undefined)
    assert.equal(result.continued, true)
})
