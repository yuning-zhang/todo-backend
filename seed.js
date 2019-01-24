const { mongoose } = require('./mongoose');
const moment = require('moment');
const Todo = require('./models/Todo');
const Label = require('./models/Label');

function getId(id) {
  return mongoose.Types.ObjectId(id);
}

const seeding = () =>
  new Promise((resolve, reject) => {
    const startTime = moment();

    Label.deleteMany({}, function(delLabelErr) {
      if (delLabelErr) {
        console.log(delLabelErr);
        reject();
      }

      Todo.deleteMany({}, function(delTodoErr) {
        if (delTodoErr) {
          console.log(delTodoErr);
          reject();
        }

        const labelArray = [
          new Label({
            name: 'work',
            hexColor: '#00A3EE'
          }),
          new Label({
            name: 'personal',
            hexColor: '#00BB8C'
          }),
          new Label({
            name: 'urgent',
            hexColor: '#BD3833'
          }),
          new Label({
            name: 'social',
            hexColor: '#22194D'
          }),
          new Label({
            name: 'finance',
            hexColor: '#1D37F9'
          })
        ];

        Label.insertMany(labelArray, function(errLabel, labelDocs) {
          if (errLabel) {
            console.log(errLabel);
            reject();
          }
          const labelIds = {};
          const labels = JSON.parse(JSON.stringify(labelDocs));

          labels.forEach(label => {
            labelIds[label.name] = label._id;
          });

          const todoArray = [
            new Todo({
              task: 'Grocery Shopping',
              createdAt: moment()
                .subtract(5, 'days')
                .format(),
              labelIds: [
                getId(labelIds['personal']),
                getId(labelIds['urgent']),
                getId(labelIds['social'])
              ]
            }),
            new Todo({
              task: 'Workout at the gym',
              createdAt: moment()
                .subtract(2, 'days')
                .format(),
              completed: true,
              completedAt: moment().format(),
              labelIds: [getId(labelIds['personal'])]
            }),
            new Todo({
              task: 'Set the lineup for fantasyfootball',
              createdAt: moment()
                .subtract(2, 'days')
                .format(),
              completed: true,
              completedAt: moment()
                .subtract(1, 'days')
                .format(),
              labelIds: [getId(labelIds['personal'])]
            }),
            new Todo({
              task: 'Go to the bank and deposit money',
              createdAt: moment().format(),
              labelIds: [getId(labelIds['finance']), getId(labelIds['urgent'])]
            }),
            new Todo({
              task: 'Go to a coding meet-up',
              createdAt: moment()
                .subtract(14, 'days')
                .format(),
              labelIds: [getId(labelIds['work']), getId(labelIds['social'])]
            }),
            new Todo({
              task: 'Make a demo website',
              createdAt: moment()
                .subtract(25, 'days')
                .format(),
              completed: true,
              completedAt: moment()
                .subtract(5, 'days')
                .format(),
              labelIds: [getId(labelIds['work'])]
            }),
            new Todo({
              task: 'Host potluck with friends',
              createdAt: moment()
                .subtract(7, 'days')
                .format(),
              labelIds: [getId(labelIds['personal']), getId(labelIds['social'])]
            })
          ];

          Todo.insertMany(todoArray, function(errTodo, todosDocs) {
            if (errTodo) {
              console.log(errTodo);
              reject();
            }
            const todoIds = {};
            const todos = JSON.parse(JSON.stringify(todosDocs));

            todos.forEach(todo => {
              todoIds[todo.task] = todo._id;
            });

            console.log(todoIds);

            Label.bulkWrite([
              {
                updateOne: {
                  filter: { _id: getId(labelIds['work']) },
                  update: {
                    todoIds: [
                      getId(todoIds['Go to a coding meet-up']),
                      getId(todoIds['Make a demo website'])
                    ]
                  }
                }
              },
              {
                updateOne: {
                  filter: { _id: getId(labelIds['personal']) },
                  update: {
                    todoIds: [
                      getId(todoIds['Grocery Shopping']),
                      getId(todoIds['Workout at the gym']),
                      getId(todoIds['Set the lineup for fantasyfootball']),
                      getId(todoIds['Host potluck with friends'])
                    ]
                  }
                }
              },
              {
                updateOne: {
                  filter: { _id: getId(labelIds['urgent']) },
                  update: {
                    todoIds: [
                      getId(todoIds['Grocery Shopping']),
                      getId(todoIds['Go to the bank and deposit money'])
                    ]
                  }
                }
              },
              {
                updateOne: {
                  filter: { _id: getId(labelIds['social']) },
                  update: {
                    todoIds: [
                      getId(todoIds['Grocery Shopping']),
                      getId(todoIds['Go to a coding meet-up']),
                      getId(todoIds['Host potluck with friends'])
                    ]
                  }
                }
              },
              {
                updateOne: {
                  filter: { _id: getId(labelIds['finance']) },
                  update: {
                    todoIds: [
                      getId(todoIds['Go to the bank and deposit money'])
                    ]
                  }
                }
              }
            ])
              .then(res => {
                console.log('Seeding successful');
                console.log(`Modified count is ${res.modifiedCount}`);
                const timePassed = moment().diff(startTime, 'seconds');
                console.log(`Seeding took ${timePassed} seconds`);
                resolve();
              })
              .catch(() => {
                console.log('Seeding failed');
                reject();
              });
          });
        });
      });
    });
  });

exports.seeding = seeding;
