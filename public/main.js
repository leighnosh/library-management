async function issueBook() {
  const titleInput = document.getElementById('bookTitle');
  const title = titleInput.value;

  try {
    const response = await axios.post('/issue', { title });
    const book = response.data;
    loadBooks();
    titleInput.value = '';
  } catch (error) {
    console.error('Error issuing book:', error);
  }
}

async function returnBook(id, issueTime) {
  try {
    const returnTime = new Date();
    const issueTimeDate = new Date(issueTime);
    const timeDifferenceInHours =
      (returnTime - issueTimeDate) / (60 * 60 * 1000);
    console.log('Time Difference (hours):', timeDifferenceInHours);

    if (!isFinite(timeDifferenceInHours)) {
      console.error('Invalid return time');
      return;
    }

    const fee = Math.max(0, Math.floor(timeDifferenceInHours) * 10);
    console.log('Calculated Fee:', fee);

    const response = await axios.post(`/return/${id}`);
    const { fee: lateFee, returnLog } = response.data;

    if (lateFee !== undefined && returnLog !== undefined) {
      loadBooks();
      updateLogContainer(returnLog, fee);
    } else {
      console.error('Error in returnBook: Invalid response structure');
    }
  } catch (error) {
    console.error('Error processing returnBook:', error);
  }
}

async function loadBooks() {
  try {
    const [booksResponse, returnLogsResponse] = await Promise.all([
      axios.get('/books'),
      axios.get('/returnLogs'),
    ]);

    const books = booksResponse.data;
    const returnLogs = returnLogsResponse.data;

    updateBookList(books);
    updateLogContainer(returnLogs);
  } catch (error) {
    console.error('Error loading books:', error);
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

function createBookDiv(book) {
  const div = document.createElement('div');
  div.id = `bookBlock-${book.id}`;
  div.className = 'bookBlock';
  const issueTime = formatTime(book.issue_time);
  const expectedReturnTime = new Date(book.issue_time);
  expectedReturnTime.setHours(expectedReturnTime.getHours() + 1);
  const expectedReturnTimeString = formatTime(expectedReturnTime);
  const currentTime = new Date();
  const timeDifferenceInHours =
    (currentTime - expectedReturnTime) / (60 * 60 * 1000);
  const fee = Math.max(0, Math.floor(timeDifferenceInHours) * 10);

  div.innerHTML = `
    <p>Book Title: ${book.title}</p>
    <p>Issue Date: ${issueTime}</p>
    <p>Expected Return Date: ${expectedReturnTimeString}</p>
    <p>Fee: ${fee} Rupees</p>
    <button onclick="returnBook(${book.id}, '${book.issue_time}')">Return Book</button>
  `;
  return div;
}

function updateLogContainer(returnLogs, fee = 0) {
  const logContainer = document.getElementById('logContainer');
  logContainer.innerHTML = '';

  returnLogs.forEach((log) => {
    const logEntry = document.createElement('div');
    logEntry.className = 'logEntry';
    logEntry.innerHTML = `
      <p>Book Name: ${log.bookTitle}</p>
      <p>Fee: ${fee || log.lateFee} Rupees</p>
      <p>Return Date: ${formatTime(log.returnTime)}</p>
    `;
    logContainer.appendChild(logEntry);
  });
}

function formatTime(timeString) {
  const date = new Date(timeString);
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(date.getTime() + istOffset);
  const formattedTime = istTime.toISOString().slice(0, 19).replace('T', ' ');
  return formattedTime;
}

loadBooks();
