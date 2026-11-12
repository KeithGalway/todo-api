const assert = require('node:assert/strict')
const test = require('node:test')
const { requireApiToken } = require('../auth')

const validToken = 'a'.repeat(64)

function runMiddleware(token) {
    let statusCode
    let responseBody
    let continued = false
    const req = { get: () => token ? `Bearer ${token}` : undefined }
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

    requireApiToken(req, res, () => { continued = true })
    return { statusCode, responseBody, continued }
}

test('rejects requests when the server token is missing or too short', (t) => {
    const previousToken = process.env.TODO_API_TOKEN
    t.after(() => {
        if (previousToken === undefined) delete process.env.TODO_API_TOKEN
        else process.env.TODO_API_TOKEN = previousToken
    })

    for (const token of ['', 'short']) {
        process.env.TODO_API_TOKEN = token
        const result = runMiddleware(validToken)
        assert.equal(result.statusCode, 401)
        assert.equal(result.continued, false)
    }
})

test('rejects missing and incorrect bearer tokens', (t) => {
    const previousToken = process.env.TODO_API_TOKEN
    process.env.TODO_API_TOKEN = validToken
    t.after(() => {
        if (previousToken === undefined) delete process.env.TODO_API_TOKEN
        else process.env.TODO_API_TOKEN = previousToken
    })

    assert.equal(runMiddleware(undefined).statusCode, 401)
    assert.equal(runMiddleware('b'.repeat(64)).statusCode, 401)
})

test('allows a request with the configured bearer token', (t) => {
    const previousToken = process.env.TODO_API_TOKEN
    process.env.TODO_API_TOKEN = validToken
    t.after(() => {
        if (previousToken === undefined) delete process.env.TODO_API_TOKEN
        else process.env.TODO_API_TOKEN = previousToken
    })

    const result = runMiddleware(validToken)
    assert.equal(result.statusCode, undefined)
    assert.equal(result.continued, true)
})
