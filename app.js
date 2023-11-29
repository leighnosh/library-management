const express = require('express');
const bodyParser = require('body-parser');
const Book = require('./models/book');
const ReturnLog = require('./models/returnLog');

const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/books', async (req, res) => {
  try {
    const books = await Book.findAll();
    res.json(books);
  } catch (error) {
    console.error('Error in /books', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/issue', async (req, res) => {
  const { title } = req.body;
  try {
    const issueTime = new Date();
    const formattedIssueTime = issueTime
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    const book = await Book.create({
      title,
      issue_time: formattedIssueTime,
    });

    res.json({ book });
  } catch (error) {
    console.error('Error in /issue', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/return/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const book = await Book.findByPk(id);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const returnTime = new Date();
    const issueTime = new Date(book.issue_time);

    const timeDifferenceInHours = (returnTime - issueTime) / 3600000;

    if (!isFinite(timeDifferenceInHours) || timeDifferenceInHours < 0) {
      return res.status(400).json({ error: 'Invalid return time' });
    }

    const lateFee = Math.floor(timeDifferenceInHours) * 10;

    const formattedReturnTime = returnTime
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    await Book.destroy({ where: { id: book.id } });

    const returnLog = await ReturnLog.create({
      bookTitle: book.title,
      lateFee: lateFee,
      returnTime: formattedReturnTime,
    });

    res.json({ lateFee, returnLog }); 
  } catch (error) {
    console.error('Error in /return/:id', error);

    res
      .status(500)
      .json({ error: 'Internal Server Error', details: error.message });
  }
});
// Get all return logs
app.get('/returnLogs', async (req, res) => {
  try {
    const returnLogs = await ReturnLog.findAll();
    res.json(returnLogs);
  } catch (error) {
    console.error('Error in /returnLogs', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
