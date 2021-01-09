const db = require('./db');

async function getMultiple(page = 1, userid) {
  const offset = getOffset(page, process.env.LIST_PER_PAGE);
  const rows = await db.query(
    'SELECT id, quote, author FROM quote WHERE userid=$1 OFFSET $2 LIMIT $3', 
    [userid, offset, process.env.LIST_PER_PAGE]
  );
  const data = emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}

function validateCreate(quote) {
  let messages = [];

  console.log(quote);

  if (!quote) {
    messages.push('No object is provided');
  }

  if (!quote.quote) {
    messages.push('Quote is empty');
  }

  if (!quote.author) {
    messages.push('Author is empty');
  }

  if (quote.quote && quote.quote.length > 255) {
    messages.push('Quote cannot be longer than 255 characters');
  }

  if (quote.author && quote.author.length > 255) {
    messages.push('Author name cannot be longer than 255 characters');
  }

  if (messages.length) {
    let error = new Error(messages.join());
    error.statusCode = 400;

    throw error;
  }
}

async function create(quote, userid){
  validateCreate(quote);
  
  const result = await db.query(
    'INSERT INTO quote(userid, quote, author) VALUES ($1, $2, $3) RETURNING *',
    [userid, quote.quote, quote.author]
  );
  let message = 'Error in creating quote';

  if (result.length) {
    message = 'Quote created successfully';
  }

  return {message};
}


function getOffset(currentPage = 1, listPerPage) {
    return (currentPage - 1) * [listPerPage];
  }
  
function emptyOrRows(rows) {
if (!rows) {
    return [];
}
return rows;
}

module.exports = {
  getMultiple,
  create
}