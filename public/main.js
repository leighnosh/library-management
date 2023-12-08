async function issueBook() {
  const titleInput = document.getElementById('bookTitle');
  const title = titleInput.value;

  try {
    await axios.post('/issue', { title });
    loadBooks();
    titleInput.value = '';
  } catch (error) {
    console.error('Error issuing book:', error);
  }
}

async function returnBook(id) {
  try {
    await axios.post(`/return/${id}`);
    loadBooks();
  } catch (error) {
    console.error('Error processing returnBook:', error);
  }
}

async function loadBooks() {
  try {
    const booksResponse = await axios.get('/books');
    const books = booksResponse.data;
    updateBookList(books);
    loadLogs();
  } catch (error) {
    console.error('Error loading books:', error);
  }
}

async function loadLogs() {
  try {
    const returnLogsResponse = await axios.get('/returnLogs');
    const returnLogs = returnLogsResponse.data;
    updateLogContainer(returnLogs);
  } catch (error) {
    console.error('Error loading return logs:', error);
  }
}

function updateBookList(books) {
  const bookList = document.getElementById('bookList');
  bookList.innerHTML = '';

  books.forEach((book) => {
    const div = createBookDiv(book);
    bookList.appendChild(div);
  });
}

function updateLogContainer(returnLogs) {
  const logContainer = document.getElementById('logContainer');
  logContainer.innerHTML = '';

  returnLogs.forEach((log) => {
    const logEntryDiv = document.createElement('div');
    logEntryDiv.className = 'logEntry';
    logEntryDiv.innerHTML = `
      <p>Book Name: ${log.bookTitle}</p>
      <p>Fee: ${log.lateFee} Rupees</p>
      <p>Return Date: ${formatTime(log.returnTime)}</p>
    `;
    logContainer.appendChild(logEntryDiv);
  });
}

function createBookDiv(book) {
  const div = document.createElement('div');
  div.id = `bookBlock-${book.id}`;
  div.className = 'bookBlock';
  const issueTime = formatTime(book.issue_time);
  const dueDate = new Date(book.issue_time);
  dueDate.setHours(dueDate.getHours() + 1);
  const dueDateTime = formatTime(dueDate);

  div.innerHTML = `
    <p>Book Title: ${book.title}</p>
    <p>Issue Date: ${issueTime}</p>
    <p>Due Date: ${dueDateTime}</p>
    <p>Fee: ${book.late_fee} Rupees</p>
    <button onclick="returnBook(${book.id})">Return Book</button>
  `;

  return div;
}

function formatTime(timeString) {
  const date = new Date(timeString);
  const formattedTime = date.toISOString().slice(0, 19).replace('T', ' ');
  return formattedTime;
}

loadBooks();
