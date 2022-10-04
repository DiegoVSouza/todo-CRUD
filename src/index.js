const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find(user => user.username === username)
  if (!user) return response.status(400).json({ error: "user not found" })
  request.user = user
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  const user = users.some(user => user.username === username)
  if (user) return response.status(400).json({ error: "user not found" })
  const new_user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(new_user)
  response.status(201).json(new_user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request
  const new_todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(new_todo)
  response.status(201).json(new_todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { id } = request.params
  const { user } = request
  const updated_todo = user.todos.find(todo => todo.id === id)
  if (!updated_todo) return response.status(404).json({ error: "todo not found" })
  updated_todo.title = title
  updated_todo.deadline = new Date(deadline)
  const new_todos = user.todos.map(todo => todo.id === id ? { ...todo, title, deadline } : { ...todo })
  user.todos = new_todos
  response.status(201).json(updated_todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const updated_todo = user.todos.find(todo => todo.id === id)
  if (!updated_todo) return response.status(404).json({ error: "todo not found" })
  updated_todo.done = true
  const new_todos = user.todos.map(todo => todo.id === id ? { ...todo, done: true } : { ...todo })
  user.todos = new_todos

  response.status(201).json(updated_todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todo = user.todos.find(todo => todo.id === id)
  if (!todo) return response.status(404).json({ error: "todo not found" })

  user.todos.splice(todo, 1)
  response.status(204).send()
});

module.exports = app;