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
 * httpErrors: boolean, default false: Should http error statuses (>=400) be reported as an error?
 * delay: Delay the response this many seconds
 * returnType: null, array, object, native? (How do we implement native? )
 *
 * TODO:
 * Currently locked in to the ZipPay model. Will try to make them modular in the future
 * Implement cancelable requests
 * Think about passing arguments through to underlying fetch?
 *
 */

import * as serverConfig from './server-config.json';
const baseUrl = `http://localhost:${serverConfig.port}/api/zippay/v${serverConfig.endpoints['zippay'].version}`;

const defaultOptions = {
  httpError: true,
};

function search(resource, options) {
  return fetch(`${baseUrl}/${resource}`).then((response) =>
    handleResponse(response, options),
  );
}

function add(resource, data, options) {
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const body = JSON.stringify(data);

  return fetch(`${baseUrl}/${resource}`, { ...request, body }).then((response) =>
    handleResponse(response, options),
  );
}

function handleResponse(response, options) {
  if (response.ok || !options.httpErrors) {
    return response
      .json()
      .then((data) => ({ data, response }))
      .catch((err) =>
        Promise.reject({ response, error: { code: -1, text: 'JSON Parse Error', err } }),
      );
  } else if (options.httpErrors) {
    return Promise.reject({
      data: getBadData(options.returnType),
      response,
      error: { code: response.status, text: response.statusText },
    });
  }
}

function findAllTransactions(options) {
  return search('transactions', { ...options, returnType: 'array' });
}

function findTransactionById(id, options) {
  return search(`transactions/${id}`, { ...options, returnType: 'object' });
}

function findAllUsers(options) {
  return search('users', { ...options, returnType: 'array' });
}

function findUserById(id, options) {
  return search(`users/${id}`, { ...options, returnType: 'object' });
}

function addUser(user) {
  return add('users', user);
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
  findUserById,
  addUser,
};

export { dao };
