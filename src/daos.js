/*
 * DAOs for this server
 *
 * Since we can assume data is always coming back as JSON, the JSON is always
 * parsed. No win in making students do that work.
 *
 * Data always comes back in an envelope like this:
 * {
 *   data: [] | {} | null // Actual data set, null on error or not found
 *   response: Response,
 *   message?: Any specific message
 *   error?: {
 *     code: Code of the error message, HTTP status code if there is one
 *     text: Text of the error message
 *   }
 * }
 *
 * find<whatever>: fetch() style semantics, particularly that response codes >399 are NOT errors
 * query<whatever>: Axios style semantics, where response codes > 399 ARE errors
 *
 *
 * Universal query options:
 * start: record to start with in the normal return set, inclusive
 * end: Record in the return set to end with, non-inclusive
 * limit: Return exactly this many records
 *
 * Other options
 * axios: boolean, default false: Use axios style queries instead
 * delay: Delay the response this many seconds
 * returnType: null, array, object, native? (How do we implement native? )
 *
 * TODO:
 * Currently locked in to the ZipPay model. Will try to make them modular in the future
 * Implement cancelable requests
 * Think about passing arguments through to underlying fetch?
 *
 */

const serverConfig = require('./server-config.json');
const baseUrl = `/api/zippay/v${serverConfig.endpoints['zippay'].version}`;

function search(resource, options) {
  return fetch(`${baseUrl}/${resource}`)
    .then((response) => {
      if (response.ok) {
        return response.json().then((data) => ({ data, response }));
      } else {
        if (options.axios) {
          return Promise.reject({
            data: getBadData(options.returnType),
            response,
            error: { code: response.status, text: response.statusText },
          });
        } else {
          return {
            data: getBadData(options.returnType),
            response,
          };
        }
      }
    })
    .catch((err) => {
      if (err.data && err.error) {
        // Likely from this DAO, pass it through
        return Promise.reject(err);
      } else {
        return {
          code: -1,
          message: 'Unknown error',
          err,
        };
      }
    });
}

function findAllTransactions() {
  return search('transactions');
}

function findTransactionById(id) {
  return search(`transactions/${id}`);
}

function findAllUsers() {
  return search('users');
}

function findUsersById(id) {
  return search(`users/${id}`);
}

function queryAllTransactions() {
  return search('transactions', { axios: true });
}

function queryTransactionById(id) {
  return search(`transactions/${id}`, { axios: true });
}

function queryAllUsers() {
  return search('users', { axios: true });
}

function queryUsersById(id) {
  return search(`users/${id}, {axios: true}`);
}

function getBadData(returnType) {
  switch (returnType) {
    case 'array':
      return [];
    case 'object':
      return {};
    default:
      return null;
  }
}

const dao = {
  findAllTransactions,
  findTransactionById,
  findAllUsers,
  findUsersById,
  queryAllTransactions,
  queryTransactionById,
  queryAllUsers,
  queryUsersById,
};

export { dao };
