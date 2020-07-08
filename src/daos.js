/*
 * DAOs for this server
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
 *
 * TODOS:
 * Universal query options:
 * start: record to start with in the normal return set, inclusive
 * end: Record in the return set to end with, non-inclusive
 * limit: Return exactly this many records
 * delay: Delay the response this many seconds
 * returnType: null, array, object, native? (How do we implement native? )
 *
 * Should http error statuses (>=400) be reported as an error?
 * Currently locked in to the ZipPay model. Will try to make them modular in the future
 * Implement cancelable requests
 * Think about passing arguments through to underlying fetch?
 *
 */

import serverConfig from './server-config.js';
const baseUrl = `http://localhost:${serverConfig.port}/api/zippay/v${serverConfig.endpoints['zippay'].version}`;

const defaultOptions = {
  httpError: false,
  signal: null,
};

function getAbortController() {
  return new AbortController();
}

function search(resource, options) {
  const mergedOptions = { ...defaultOptions, ...options };

  return fetch(`${baseUrl}/${resource}`, mergedOptions).then((response) =>
    handleResponse(response, mergedOptions),
  );
}

function add(resource, data, options) {
  const mergedOptions = { ...defaultOptions, ...options };

  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const body = JSON.stringify(data);

  return fetch(`${baseUrl}/${resource}`, {
    ...request,
    body,
    ...mergedOptions,
  }).then((response) => handleResponse(response, mergedOptions));
}

function handleResponse(response, options) {
  if (response.ok || !options.httpErrors) {
    return response
      .json()
      .then((data) => {
        return { data, response };
      })
      .catch((error) =>
        Promise.reject({
          response,
          error: { code: -1, text: 'DAO Error', error },
        }),
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
  getAbortController,
};

export { dao };
