const _ = require('lodash');
const moment = require('moment');

const Todo = require('../models/Todo');

exports.getTodo = function(req, res) {
  Todo.find({})
    .then(todos => res.send({ todos }))
    .catch(e => res.send(new Error(e)));
};

exports.postTodo = function(req, res) {
  const task = req.body.task;
  if (!_.isString(task) || task.trim().length === 0) {
    return res.status(400).send({ error: 'Invalid Todo' });
  }
  const todo = new Todo({
    task: req.body.task,
    createdAt: moment().format()
  });
  todo
    .save()
    .then(savedTodo => {
      res.send({ savedTodo });
    })
    .catch(e => {
      console.log(e);
      res
        .status(500)
        .send({ error: 'Error occured while saving data to server' });
    });
};

exports.patchTodo = function(req, res) {
  const id = req.params.id;
  let newTodo = _.pick(req.body, ['task', 'completed', 'labelIds']);

  // Handle newTodo task
  if (!_.isString(newTodo.task)) {
    newTodo = _.omit(newTodo, 'task');
  }

  // Handle newTodo completion
  if (_.isBoolean(newTodo.completed)) {
    if (newTodo.completed) {
      newTodo.completedAt = moment().format();
    } else {
      newTodo.completed = false;
      newTodo.completedAt = null;
    }
  } else {
    newTodo = _.omit(newTodo, 'completed');
  }

  // Handle newTodo labels
  if (!_.isArray(newTodo.labelIds)) {
    newTodo = _.omit(newTodo, 'labelIds');
  }

  Todo.findById(id, (err, todo) => {
    if (err) {
      console.log(err);
      res.status(500).send({ error: 'Server has encountered error' });
    } else if (!todo) {
      res.status(404).send({ error: 'No todo found' });
    } else {
      _.forOwn(newTodo, (value, key) => {
        todo.set({ [key]: value });
      });
      todo
        .save()
        .then(updatedTodo => {
          res.send({ updatedTodo });
        })
        .catch(err => {
          const message = err.message || 'Problem has occurred updating todo';
          res.status(400).send({ error: message });
        });
    }
  });
};

exports.deleteTodo = function(req, res) {
  const id = req.params.id;
  Todo.findByIdAndDelete(id)
    .then(deletedTodo => {
      if (deletedTodo)
        return res.send({ message: 'Todo successfully deleted' });
      else return res.status(404).send({ error: 'No todo found' });
    })
    .catch(e => {
      console.log(e);
      res.status(500).send({ error: "Server can't delete todo" });
    });
};
