const mongoose = require('mongoose');

const { serverConnect } = require('./ssh');

const database = process.env.database || 'demo_app';
const DB_USER = encodeURIComponent(process.env.DB_USER);
const DB_PASSWORD = encodeURIComponent(process.env.DB_PASSWORD);
mongooseUrl = `mongodb://${DB_USER}:${DB_PASSWORD}@127.0.0.1:27017/${database}?authSource=admin`;

if (process.env.NODE_ENV === 'development') {
  // Development - localhost backend server ssh tunnel into database hosted on DigitalOcean
  const server = serverConnect((error, server) => {
    if (error) {
      return console.log('SSH connection error: ', error);
    }

    mongoose.connect(
      mongooseUrl,
      { useNewUrlParser: true }
    );
  });

  server.on('error', function(err) {
    console.error('Something bad happened:', err);
  });
} else {
  // Production - database hosted on same server as backend server, no need for ssh tunneling
  mongoose.connect(
    mongooseUrl,
    { useNewUrlParser: true }
  );
}

module.exports = { mongoose };
