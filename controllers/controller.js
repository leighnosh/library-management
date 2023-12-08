const Book = require('../models/book');
const ReturnLog = require('../models/returnLog');

const calculateLateFee = (issueTime) => {
  const currentTime = new Date();
  const timeDifferenceInHours = (currentTime - new Date(issueTime)) / 36e5;
  return Math.max(0, Math.floor(timeDifferenceInHours - 1) * 10);
};

exports.getAllBooks = async (req, res) => {
  try {
    let books = await Book.findAll();
    books = books.map((bookData) => {
      const book = bookData.get();
      book.late_fee = calculateLateFee(book.issue_time);
      return book;
    });
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
    book.late_fee = 0;
    res.json(book);
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
    await Book.destroy({ where: { id: book.id } });

    res.json({ returnLog });
  } catch (error) {
    handleError(res, error);
  }
};

const processReturn = async (book) => {
  const returnTime = new Date();
  const lateFee = calculateLateFee(book.issue_time);

  return await ReturnLog.create({
    bookTitle: book.title,
    lateFee,
    returnTime,
  });
};

const handleError = (res, error) => {
  res
    .status(500)
    .json({ error: 'Internal Server Error', details: error.message });
};

exports.getAllReturnLogs = async (req, res) => {
  try {
    const returnLogs = await ReturnLog.findAll();
    res.json(returnLogs);
  } catch (error) {
    handleError(res, error);
  }
};
