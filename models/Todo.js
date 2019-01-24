const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  task: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  completed: {
    type: Boolean,
    required: true,
    default: false
  },
  createdAt: {
    type: String,
    required: true
  },
  completedAt: {
    type: String,
    default: null
  },
  labelIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Label'
    }
  ],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

todoSchema.path('labelIds').validate(idsArray => {
  const promiseArr = idsArray.map(
    id =>
      new Promise((resolve, reject) => {
        mongoose.model('Label').findOne({ _id: id }, (err, label) => {
          if (err || !label) {
            reject(false);
          }
          resolve(true);
        });
      })
  );

  return Promise.all(promiseArr)
    .then(result => result)
    .catch(result => result);
}, 'Validation of label ids `[{VALUE}]` failed');

todoSchema.pre('save', async function() {
  const todoId = this._id;
  const response = await Todo.findOne({ _id: todoId }).exec();

  if (!response) return;

  let currentLabels = response.toObject().labelIds;
  let nextLabels = this.toObject().labelIds;

  const labelsToRemove = currentLabels.filter(
    label => !nextLabels.toString().includes(label.toString())
  );

  const labelsToAdd = nextLabels.filter(
    label => !currentLabels.toString().includes(label.toString())
  );

  try {
    const removePromises = labelsToRemove.map(labelId => {
      return mongoose
        .model('Label')
        .updateOne({ _id: labelId }, { $pull: { todoIds: todoId } })
        .exec();
    });
    const addPromises = labelsToAdd.map(labelId => {
      return mongoose
        .model('Label')
        .updateOne({ _id: labelId }, { $addToSet: { todoIds: todoId } })
        .exec();
    });
    await Promise.all([...removePromises, ...addPromises]);
  } catch (err) {
    console.log(err);
    throw new Error('Server has encounter error during update');
  }
});

todoSchema.pre('findOneAndDelete', async function() {
  let todoId = this.getQuery()._id;

  try {
    const todo = await Todo.findOne({ _id: todoId }).exec();
    const labelsToRemove = todo.labelIds;
    const removePromises = labelsToRemove.map(labelId => {
      return mongoose
        .model('Label')
        .updateOne({ _id: labelId }, { $pull: { todoIds: todoId } })
        .exec();
    });
    await Promise.all(removePromises);
  } catch (err) {
    console.log(err);
    throw new Error('Server has encounter error during delete');
  }
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;
