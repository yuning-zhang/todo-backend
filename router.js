const { mongoose } = require('./mongoose');
const { seeding } = require('./seed');

const Authentication = require('./controllers/authentication');
const passportService = require('./services/passport');
const passport = require('passport');
const TodoRoute = require('./controllers/todoRoute');
const LabelRoute = require('./controllers/labelRoute');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

module.exports = function(app) {
  app.post('/signup', Authentication.signup);

  app.post('/signin', requireSignin, Authentication.signin);

  app.post('/user', requireAuth, (req, res) => {
    const { email, joined } = req.user;
    res.send({ email, joined });
  });

  app.get('/reset', (req, res) => {
    seeding()
      .then(() => {
        console.log('SENT RESET');
        res.status(200).send('DONE');
      })
      .catch(() => {
        console.log('SENT FAILED');
        res.status(500).send('FAILED');
      });
  });

  app.get('/todos', TodoRoute.getTodo);

  app.post('/todos', TodoRoute.postTodo);

  app.patch('/todos/:id', TodoRoute.patchTodo);

  app.delete('/todos/:id', TodoRoute.deleteTodo);

  app.get('/labels', LabelRoute.getLabel);

  app.post('/labels', LabelRoute.postLabel);

  app.delete('/labels/:id', LabelRoute.deleteLabel);
};
