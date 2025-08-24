const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require('path'); // Ensure this is at the top

const app = express();

const JWT_SECRET = process.env.JWT_SECRET || "randomremonlike";

app.use(cors());
app.use(express.json());

// This serves static files like CSS, client-side JS, and images
app.use(express.static(path.join(__dirname)));

// In-memory storage
const users = [];
const todos = {};

// --- HTML Page Routes ---
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "page.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/todos-page", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


// --- API Routes ---
function logger(req, res, next) {
    console.log(req.method + " request for " + req.url);
    next();
}

app.post("/signup", logger, (req, res) => {
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

app.post("/signin", logger, (req, res) => {
    const { username, password } = req.body;
    const founduser = users.find(u => u.username === username && u.password === password);
    if (founduser) {
        const token = jwt.sign({ username }, JWT_SECRET);
        return res.json({ message: "You are signed in", token });
    }
    res.status(401).json({ message: "Invalid username or password" });
});

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

app.get("/todos", logger, auth, (req, res) => {
    res.json(todos[req.username] || []);
});

app.post("/todos", logger, auth, (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Text required" });
    const userTodos = todos[req.username] || [];
    const newTodo = { id: userTodos.length + 1, text, completed: false };
    userTodos.push(newTodo);
    todos[req.username] = userTodos;
    res.json(newTodo);
});

app.put('/todos/:id', logger, auth, (req, res) => {
    const todo = (todos[req.username] || []).find(t => t.id === parseInt(req.params.id));
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    if (typeof req.body.completed === 'boolean') todo.completed = req.body.completed;
    res.json(todo);
});

app.delete('/todos/:id', logger, auth, (req, res) => {
    const userTodos = todos[req.username] || [];
    const index = userTodos.findIndex(t => t.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ message: 'Todo not found' });
    userTodos.splice(index, 1);
    res.json({ message: 'Todo deleted' });
});

app.post('/logout', auth, (req, res) => {
    res.json({ message: 'Logged out' });
});

// This line is CRITICAL for Vercel
module.exports = app;
