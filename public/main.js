async function issueBook() {
  const title = document.getElementById('bookTitle').value;

  try {
    const response = await axios.post('/issue', { title });
    const book = response.data;
    loadBooks();
  } catch (error) {
    console.error('Error issuing book:', error);
  }
}

async function returnBook(id) {
  try {
    const response = await axios.post(`/return/${id}`);
    const responseData = response.data;

    console.log('Response Data:', responseData);

    const lateFee = responseData.lateFee;
    const returnLog = responseData.returnLog;

    if (lateFee !== undefined && returnLog !== undefined) {
      loadBooks();

      const logContainer = document.getElementById('logContainer');
      const logEntry = document.createElement('div');
      logEntry.innerHTML = `
        <p>Book Name: ${returnLog.bookTitle}</p>
        <p>Late Fee: ${lateFee} Rupees</p>
        <p>Return Date: ${returnLog.returnTime}</p>
      `;
      logContainer.appendChild(logEntry);
    } else {
      console.error('Error in returnBook: Invalid response structure');
    }
  } catch (error) {
    console.error('Error processing returnBook:', error);
  }
}

async function loadBooks() {
  try {
    const booksResponse = await axios.get('/books');
    const books = booksResponse.data;

    const bookList = document.getElementById('bookList');
    bookList.innerHTML = '';

    books.forEach((book) => {
      const div = document.createElement('div');
      div.id = `bookBlock-${book.id}`;
      div.className = 'bookBlock';
      div.innerHTML = `
        <p>Title: ${book.title}</p>
        <p>Issue Time: ${formatTime(book.issue_time)}</p>
        <p>Return Time: ${
          book.return_time ? formatTime(book.return_time) : 'Not returned yet'
        }</p>
        <p>Late Fee: ${book.late_fee} Rupees</p>
        <button onclick="returnBook(${book.id})">Return Book</button>
      `;
      bookList.appendChild(div);
    });

    const returnLogsResponse = await axios.get('/returnLogs');
    const returnLogs = returnLogsResponse.data;

    const logContainer = document.getElementById('logContainer');
    logContainer.innerHTML = '';

    returnLogs.forEach((log) => {
      const logEntry = document.createElement('div');
      logEntry.className = 'logEntry';
      logEntry.innerHTML = `
        <p>Book Name: ${log.bookTitle}</p>
        <p>Late Fee: ${log.lateFee} Rupees</p>
        <p>Return Date: ${formatTime(log.returnTime)}</p>
      `;
      logContainer.appendChild(logEntry);
    });
  } catch (error) {
    console.error('Error loading books:', error);
  }
}

function formatTime(timeString) {
  const date = new Date(timeString);
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(date.getTime() + istOffset);
  return istTime.toLocaleString();
}

loadBooks();
