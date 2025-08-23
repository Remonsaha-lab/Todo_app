document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login first");
        window.location.href = "../login_page/login.html";
        return;
    }

    const display = document.getElementById("userDisplay");
    if (display) display.textContent = localStorage.getItem("username") || '';

    const todoInput = document.getElementById("input_box");
    const todoList = document.getElementById("Todo-List");
    const addButton = document.querySelector('.todo-input button');

    // addtodo.addEventListener("click" , ()=> {
    //     const todoText = todoInput.value.trim();
    //     if(!todoText){
    //         alert("Please enter a task");
    //         return;
    //     }
    //     else{
    //         const list = document.createElement("li");
    //         list.textContent = todoText;
    //         todoList.appendChild(list);
    //         todoInput.value = "";
    //     }
    // })
    const headers = { Authorization: `Bearer ${token}` };

    const fetchTodos = async () => {
        try {
            const response = await axios.get("http://localhost:3004/todos", { headers });
            (response.data || []).forEach(renderTodo);
        } catch (error) {
            console.error("Error fetching todos:", error);
        }
    };

    function renderTodo(todo) {
        const li = document.createElement("li");
        li.dataset.id = todo.id;
        li.textContent = todo.text + " ";
        li.style.textDecoration = todo.completed ? "line-through" : "none";
        const toggleButton = document.createElement("button");
        toggleButton.textContent = todo.completed ? "Undo" : "Complete";
        toggleButton.onclick = () => updateTodo(todo.id, !todo.completed);
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deleteTodo(todo.id);
        li.appendChild(toggleButton);
        li.appendChild(deleteButton);
        todoList.appendChild(li);
    }

    async function addTodo() {
        const text = todoInput.value.trim();
        if (!text) return;
        try {
            const response = await axios.post("http://localhost:3004/todos", { text }, { headers });
            renderTodo(response.data);
            todoInput.value = "";
        } catch (e) {
            console.error('Error adding todo', e);
        }
    }

    async function updateTodo(id, completed) {
        try {
            const response = await axios.put(`http://localhost:3004/todos/${id}`, { completed }, { headers });
            const li = document.querySelector(`li[data-id="${id}"]`);
            if (li) {
                li.style.textDecoration = response.data.completed ? "line-through" : "none";
                li.querySelector('button').textContent = response.data.completed ? 'Undo' : 'Complete';
            }
        } catch (e) {
            console.error('Error updating todo', e);
        }
    }

    async function deleteTodo(id) {
        try {
            await axios.delete(`http://localhost:3004/todos/${id}`, { headers });
            const li = document.querySelector(`li[data-id="${id}"]`);
            if (li) li.remove();
        } catch (e) {
            console.error('Error deleting todo', e);
        }
    }

    window.logout = async function () {
        try {
            await axios.post('http://localhost:3004/logout', {}, { headers });
        } catch (_) {}
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = "../login_page/login.html";
    };

    if (addButton) addButton.addEventListener('click', addTodo);
    if (todoInput) todoInput.addEventListener('keyup', e => { if (e.key === 'Enter') addTodo(); });
    fetchTodos();
});