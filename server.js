require('dotenv').config()

const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const mongoose = require('mongoose')

const app = express()
const port = process.env.PORT || 10000
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

const todoSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 180 },
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
    dueDate: { type: Date, default: null }
}, { timestamps: true })

const Todo = mongoose.model('Todo', todoSchema)

app.use(helmet())
app.use(cors({
    origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin))
}))
app.use(express.json({ limit: '16kb' }))

app.get('/health', (req, res) => {
    res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
})

app.get('/api/todos', async (req, res, next) => {
    try {
        const todos = await Todo.find().sort({ completed: 1, dueDate: 1, createdAt: -1 }).lean()
        res.json({ todos })
    } catch (error) {
        next(error)
    }
})

app.post('/api/todos', async (req, res, next) => {
    try {
        const { title, completed, priority, dueDate } = req.body
        if (typeof title !== 'string' || !title.trim() || title.trim().length > 180) {
            return res.status(400).json({ error: 'Title must be between 1 and 180 characters.' })
        }
        if (completed !== undefined && typeof completed !== 'boolean') {
            return res.status(400).json({ error: 'Completed must be a boolean.' })
        }
        if (priority !== undefined && !['low', 'normal', 'high'].includes(priority)) {
            return res.status(400).json({ error: 'Priority must be low, normal, or high.' })
        }
        const parsedDueDate = parseDueDate(dueDate)
        if (parsedDueDate === false) {
            return res.status(400).json({ error: 'Due date must use YYYY-MM-DD format.' })
        }

        const todo = await Todo.create({
            title: title.trim(),
            completed,
            priority,
            dueDate: parsedDueDate
        })
        res.status(201).json({ todo })
    } catch (error) {
        next(error)
    }
})

app.patch('/api/todos/:id', async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Todo ID is invalid.' })
        }

        const allowedFields = ['title', 'completed', 'priority', 'dueDate']
        const fields = Object.keys(req.body)
        if (!fields.length || fields.some((field) => !allowedFields.includes(field))) {
            return res.status(400).json({ error: 'Provide one or more valid todo fields to update.' })
        }

        const updates = {}
        if (Object.hasOwn(req.body, 'title')) {
            if (typeof req.body.title !== 'string' || !req.body.title.trim() || req.body.title.trim().length > 180) {
                return res.status(400).json({ error: 'Title must be between 1 and 180 characters.' })
            }
            updates.title = req.body.title.trim()
        }
        if (Object.hasOwn(req.body, 'completed')) {
            if (typeof req.body.completed !== 'boolean') {
                return res.status(400).json({ error: 'Completed must be a boolean.' })
            }
            updates.completed = req.body.completed
        }
        if (Object.hasOwn(req.body, 'priority')) {
            if (!['low', 'normal', 'high'].includes(req.body.priority)) {
                return res.status(400).json({ error: 'Priority must be low, normal, or high.' })
            }
            updates.priority = req.body.priority
        }
        if (Object.hasOwn(req.body, 'dueDate')) {
            updates.dueDate = parseDueDate(req.body.dueDate)
            if (updates.dueDate === false) {
                return res.status(400).json({ error: 'Due date must use YYYY-MM-DD format.' })
            }
        }

        const todo = await Todo.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        })
        if (!todo) return res.status(404).json({ error: 'Todo was not found.' })
        res.json({ todo })
    } catch (error) {
        next(error)
    }
})

app.delete('/api/todos/:id', async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Todo ID is invalid.' })
        }
        const todo = await Todo.findByIdAndDelete(req.params.id)
        if (!todo) return res.status(404).json({ error: 'Todo was not found.' })
        res.status(204).end()
    } catch (error) {
        next(error)
    }
})

app.use((req, res) => res.status(404).json({ error: 'Route was not found.' }))

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error)
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({ error: 'Request body must contain valid JSON.' })
    }
    console.error(error)
    res.status(500).json({ error: 'An unexpected server error occurred.' })
})

function parseDueDate(value) {
    if (value === undefined || value === null || value === '') return null
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
    const date = new Date(`${value}T00:00:00.000Z`)
    return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? false : date
}

async function start() {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is required.')
    }
    await mongoose.connect(process.env.MONGODB_URI)
    app.listen(port, () => console.log(`Todo API listening on port ${port}`))
}

start().catch((error) => {
    console.error('Unable to start the todo API:', error.message)
    process.exitCode = 1
})
