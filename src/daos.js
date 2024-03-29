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

import { DAOError } from './DAOError.js';
import serverConfig from './server-config.js';

// eslint-disable-next-line max-len
const baseUrl = `http://localhost:${serverConfig.port}/api/zippay/v${serverConfig.endpoints.zippay.version}`;
const testUrl = `${baseUrl}/users/113`;

const abortController = new AbortController();
const defaultOptions = {
  signal: abortController.signal,
};

const defaultData = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  active: true,
};

function getAbortController() {
  return abortController;
}

function optionsToQueryString( options = {} ) {
  const clonedOptions = { ...options };
  const queryStringKeys = [ '_delay' ];
  const queryString = {};
  queryStringKeys.forEach( ( key ) => {
    if ( !clonedOptions[key] ) return;
    queryString[key] = clonedOptions[key];
    delete clonedOptions[key];
  } );

  return [ new URLSearchParams( queryString ).toString(), clonedOptions ];
}

function search( resource, options ) {
  const [ queryString, mergedOptions ] = optionsToQueryString( {
    ...defaultOptions,
    ...options,
  } );

  return fetch( `${baseUrl}/${resource}?${queryString}`, mergedOptions )
    .then( ( response ) => handleResponse( response, mergedOptions ) )
    .catch( ( error ) => {
      return Promise.reject(
        error instanceof DOMException
          ? { code: -10, text: 'Promise Aborted!', error }
          : error,
      );
    } );
}

function add( resource, data, options ) {
  const [ queryString, mergedOptions ] = optionsToQueryString( {
    ...defaultOptions,
    ...options,
  } );

  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  data = { ...defaultData, ...data };
  const body = JSON.stringify( data );

  return fetch( `${baseUrl}/${resource}?${queryString}`, {
    ...request,
    body,
    ...mergedOptions,
  } ).then( ( response ) => handleResponse( response, mergedOptions ) );
}

function handleResponse( response ) {
  if ( response.ok ) {
    return (
      response
        .json()
        .then( ( data ) => {
          return { data, response };
        } )
        // eslint-disable-next-line
        .catch((error) => {
          throw new DAOError( response, 'JSON parsing error' );
        } )
    );
  } else {
    return { response, data: null };
  }
}

function findAllTransactions( options ) {
  return search( 'transactions', options );
}

function findTransactionById( id, options ) {
  return search( `transactions/${id}`, options );
}

function findAllUsers( options ) {
  return search( 'users', options );
}

function findUserById( id, options ) {
  return search( `users/${id}`, options );
}

function addUser( user ) {
  return add( 'users', user );
}

const dao = {
  findAllTransactions,
  findTransactionById,
  findAllUsers,
  findUserById,
  addUser,
  getAbortController,
};

export { dao, testUrl };
