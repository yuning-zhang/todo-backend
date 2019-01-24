const mongoose = require('mongoose');

const labelSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    lowercase: true
  },
  hexColor: {
    type: String,
    validate: function(v) {
      return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(v);
    }
  },
  todoIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Todo'
    }
  ],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

labelSchema.pre('findOneAndDelete', async function() {
  const labelId = this.getQuery()._id;

  try {
    const label = await Label.findOne({ _id: labelId }).exec();
    const todoToRemove = label.todoIds;
    const removePromises = todoToRemove.map(todoId => {
      return mongoose
        .model('Todo')
        .updateOne({ _id: todoId }, { $pull: { labelIds: labelId } })
        .exec();
    });
    await Promise.all(removePromises);
  } catch (err) {
    console.log(err);
    throw new Error('Server has encounter error during delete');
  }
});

const Label = mongoose.model('Label', labelSchema);

module.exports = Label;
