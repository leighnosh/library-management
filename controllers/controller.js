const Book = require('../models/book');
const ReturnLog = require('../models/returnLog');

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll();
    res.json(books);
  } catch (error) {
    handleError(res, error);
  }
};

exports.issueBook = async (req, res) => {
  const { title } = req.body;
  try {
    const book = await Book.create({
      title,
      issue_time: new Date(),
    });

    res.json({ book });
  } catch (error) {
    handleError(res, error);
  }
};

exports.returnBook = async (req, res) => {
  const { id } = req.params;
  try {
    const book = await Book.findByPk(id);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const returnLog = await processReturn(book);

    res.json({ fee: returnLog.lateFee, returnLog });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getAllReturnLogs = async (req, res) => {
  try {
    const returnLogs = await ReturnLog.findAll();
    res.json(returnLogs);
  } catch (error) {
    handleError(res, error);
  }
};

const processReturn = async (book) => {
  const returnTime = new Date();
  const issueTime = new Date(book.issue_time);

  const timeDifferenceInHours = (returnTime - issueTime) / (60 * 60 * 1000);

  if (!isFinite(timeDifferenceInHours) || timeDifferenceInHours < 0) {
    throw new Error('Invalid return time');
  }

  let fee = 0;

  if (timeDifferenceInHours > 1) {
    fee = Math.floor(timeDifferenceInHours - 1) * 10;
  }

  await Book.destroy({ where: { id: book.id } });

  return await ReturnLog.create({
    bookTitle: book.title,
    lateFee: fee,
    returnTime: new Date(),
  });
};

const handleError = (res, error) => {
  res
    .status(500)
    .json({ error: 'Internal Server Error', details: error.message });
};
