/* eslint-env jest */
/* global fetchMock */

import { dao } from './daos.js';

// TODO: Something in here doesn't handle a failure (e.g. no catch )
describe( 'DAO tests with a failed response', () => {
  test( 'It should return http status >399 as success', () => {
    const httpError = {
      ok: true,
      status: 404,
      body: JSON.stringify( [] ),
    };
    fetchMock.mockResponseOnce( () => Promise.resolve( httpError ) );

    return dao.findAllTransactions().then( ( res ) => {
      expect( res.response.status ).toEqual( httpError.status );
      expect( res.data ).toEqual( null );
    } );
  } );

  test( 'It should handle poorly formed JSON', () => {
    fetchMock.mockResponseOnce( () => {
      let data = JSON.stringify( [ 'one' ] );
      data = data.slice( 0, -1 );
      return Promise.resolve( { body: data } );
    } );

    return dao.findAllTransactions().catch( ( error ) => {
      expect( error ).toBeDefined();
      expect( error.toString() ).toMatch( /^DAOError/ );
    } );
  } );
} );

describe( 'Cancel functionality', () => {
  beforeEach( () => {
    fetch.resetMocks();
    fetch.doMock();
    jest.useFakeTimers();
  } );

  afterEach( () => {
    jest.useRealTimers();
  } );

  it( 'rejects when aborted before resolved', async() => {
    const c = dao.getAbortController();
    fetch.mockResponseOnce( async() => {
      jest.advanceTimersByTime( 200 );
      return { body: JSON.stringify( [] ) };
    } );
    setTimeout( () => {
      c.abort();
    }, 50 );
    return dao.findAllUsers().catch( ( error ) => {
      expect( error ).toHaveProperty( 'text', 'Promise Aborted!' );
    } );
  } );
} );
