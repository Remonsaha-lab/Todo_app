const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const serverless = require("serverless-http");

const app = express();

const JWT_SECRET = process.env.JWT_SECRET || "randomremonlike";

app.use(cors());
app.use(express.json());

// In-memory storage (Note: Resets on function cold start)
// For a production app, use a real database.
const users = [];
const todos = {};

// Helper to get username from token
function auth(req, res, next) {
    try {
        let token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Token missing" });

        const decodedInfo = jwt.verify(token, JWT_SECRET);
        req.username = decodedInfo.username;
        next();
    } catch (e) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

function logger(req, res, next) {
    console.log(req.method + " request for " + req.url);
    next();
}

// Routes
// Note: We don't need to wrap routes in /api/ or /.netlify/functions/api here
// because we will mount the express app to that path or use a router.
// However, typically with serverless-http and express, the paths in express need to match the request path.
// Netlify rewrite rule: /api/* -> /.netlify/functions/api
// So the request coming in will be /.netlify/functions/api/signup
// So we should use a router mounted at /.netlify/functions/api OR just handle the paths directly.

const router = express.Router();

router.post("/signup", logger, (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }
    if (users.find(u => u.username === username)) {
        return res.status(409).json({ message: "User already exists" });
    }
    users.push({ username, password });
    const token = jwt.sign({ username }, JWT_SECRET);
    res.json({ message: "Hey you are signed up", token });
});

router.post("/signin", logger, (req, res) => {
    const { username, password } = req.body;
    const founduser = users.find(u => u.username === username && u.password === password);
    if (founduser) {
        const token = jwt.sign({ username }, JWT_SECRET);
        return res.json({ message: "You are signed in", token });
    }
    res.status(401).json({ message: "Invalid username or password" });
});

router.get("/todos", logger, auth, (req, res) => {
    res.json(todos[req.username] || []);
});

router.post("/todos", logger, auth, (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Text required" });
    const userTodos = todos[req.username] || [];
    const newTodo = { id: Date.now(), text, completed: false }; // Changed to Date.now() for better uniqueness
    userTodos.push(newTodo);
    todos[req.username] = userTodos;
    res.json(newTodo);
});

router.put('/todos/:id', logger, auth, (req, res) => {
    const todo = (todos[req.username] || []).find(t => t.id === parseInt(req.params.id));
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    if (typeof req.body.completed === 'boolean') todo.completed = req.body.completed;
    res.json(todo);
});

router.delete('/todos/:id', logger, auth, (req, res) => {
    const userTodos = todos[req.username] || [];
    const index = userTodos.findIndex(t => t.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ message: 'Todo not found' });
    userTodos.splice(index, 1);
    res.json({ message: 'Todo deleted' });
});

router.post('/logout', auth, (req, res) => {
    res.json({ message: 'Logged out' });
});

// Mount the router at multiple paths to ensure it catches the request 
// regardless of how the URL is rewritten or passed by serverless-http
app.use("/.netlify/functions/api", router);
app.use("/api", router);
app.use("/", router); // Fallback for local dev or direct invocation

module.exports.handler = serverless(app);
