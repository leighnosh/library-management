const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const controller = require('./controllers/controller');
const sequelize = require('./util/database');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.get('/books', controller.getAllBooks);
app.post('/issue', controller.issueBook);
app.post('/return/:id', controller.returnBook);
app.get('/returnLogs', controller.getAllReturnLogs);

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
