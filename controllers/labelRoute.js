const _ = require('lodash');
const randomColor = require('randomcolor');

const Label = require('../models/Label');

exports.getLabel = function(req, res) {
  Label.find({})
    .then(labels => res.send({ labels }))
    .catch(e => res.send(new Error(e)));
};

exports.postLabel = function(req, res) {
  let { name, hexColor } = req.body;
  if (!_.isString(name) || name.trim().length === 0) {
    return res.status(400).send({ error: 'Invalid Todo' });
  }
  Label.findOne({ name }).then(label => {
    if (label) {
      res.status(400).send({ error: 'Duplicate Label Name' });
    } else {
      hexColor = hexColor || randomColor();
      const newLabel = new Label({ name, hexColor });
      newLabel
        .save()
        .then(savedLabel => {
          res.send({ savedLabel });
        })
        .catch(e => {
          console.log(e);
          res
            .status(500)
            .send({ error: 'Error occured while saving data to server' });
        });
    }
  });
};

exports.deleteLabel = function(req, res) {
  const id = req.params.id;
  Label.findByIdAndDelete(id)
    .then(deletedLabel => {
      if (deletedLabel)
        return res.send({ message: 'Label successfully deleted' });
      else return res.status(404).send({ error: 'No label found' });
    })
    .catch(e => {
      console.log(e);
      res.status(500).send({ error: "Server can't delete todo" });
    });
};
