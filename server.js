const path = require('path');
const express = require("express");
const JWT_SECRET = process.env.JWT_SECRET || "randomremonlike";
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json()); //help to parse any post from body

const users = [];

const todos = {};

function logger(req, res, next) {
    console.log(req.method + " request came");
    next();
}
app.use(express.static(path.join(__dirname)));
// --- HTML Page Routes ---

// This route serves your main landing page (page.html)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "page.html"));
});

// This route serves the login page
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

// This route serves the main todo app page
app.get("/todos-page", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});
app.post("/signup", logger, (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }
    const exists = users.find(u => u.username === username);
    if (exists) {
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
        let token = req.headers.token;
        // Support Authorization: Bearer <token>
        if (!token && req.headers.authorization) {
            const parts = req.headers.authorization.split(" ");
            if (parts[0].toLowerCase() === "bearer") token = parts[1];
        }
        if (!token) return res.status(401).json({ message: "Token missing" });
        const decodedInfo = jwt.verify(token, JWT_SECRET);
        if (!decodedInfo || !decodedInfo.username) {
            return res.status(401).json({ message: "Invalid token" });
        }
        req.username = decodedInfo.username;
        next();
    } catch (e) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

app.get("/todos", logger, auth, (req, res) => {
    const userTodos = todos[req.username] || [];
    res.json(userTodos);
});

app.post("/todos", logger, auth, (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ message: "Text required" });
    }
    const userTodos = todos[req.username] || [];
    const newTodo = {
        id: userTodos.length + 1,
        text,
        completed: false
    };
    userTodos.push(newTodo);
    todos[req.username] = userTodos;
    res.json(newTodo);
});

app.put('/todos/:id', logger, auth, (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    const userTodos = todos[req.username] || [];
    const todo = userTodos.find(t => t.id === parseInt(id));
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    if (typeof completed === 'boolean') todo.completed = completed;
    res.json(todo);
});

app.delete('/todos/:id', logger, auth, (req, res) => {
    const { id } = req.params;
    const userTodos = todos[req.username] || [];
    const index = userTodos.findIndex(t => t.id === parseInt(id));
    if (index === -1) return res.status(404).json({ message: 'Todo not found' });
    userTodos.splice(index, 1);
    todos[req.username] = userTodos;
    res.json({ message: 'Todo deleted' });
});


app.post('/logout', auth, (req, res) => {
    res.json({ message: 'Logged out (client should discard token)' });
});

module.exports = app;

// This part is for running locally, Vercel will ignore it
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});








