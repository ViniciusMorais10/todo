const express = require('express');
const cors = require('cors');

const { v4: uuid } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const verifyExistsUser = users.find((user) => user.username === username);

  if(!verifyExistsUser){
    return response.status(404).json({error:"User not found with username!"});
  }
  request.user = verifyExistsUser;

  next();
}

app.post('/users', (request, response) => {
  const { name , username } = request.body;
  const verifyExistsUsername = users.some((user) => user.username === username);

  if(verifyExistsUsername) {
    return response.status(400).json({error:"Username alredy exists!"});
  }

  const user = {
    id: uuid(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  
  return response.send(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline} = request.body;
  const { user } = request;

  const todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);


});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline} = request.body;
  const { id } = request.params;
  const { user } = request;

  const todoExists = user.todos.find((todo) => todo.id === id);

  if(!todoExists){
    return response.status(404).json({error:"Todo not exists!"});
  }

  todoExists.title = title;
  todoExists.deadline = new Date(deadline);

  return response.json(todoExists);


});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoExists = user.todos.find((todo) => todo.id === id);

  if(!todoExists){
    return response.status(404).json({error: "Todo not exists!"});
  }

  todoExists.done = true;

  return response.json(todoExists);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoExists = user.todos.find((todo) => todo.id === id);

  if(!todoExists){
    return response.status(404).json({error:"Todo not exists!"});
  }

  user.todos.splice(todoExists,1);

  return response.status(204).send();

});

module.exports = app;