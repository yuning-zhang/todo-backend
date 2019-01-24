const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();
const router = require('./router');
const port = process.env.DB_PORT || 8000;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
router(app);

app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
