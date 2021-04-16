/* eslint-env jest */

const { getReason } = require( './reasons' );
const reasons = require( '../data/seeds/reasons.json' );

test( 'Should return a reason for a user', () => {
  const payee = 'DCHM$101';
  const expectedReasons = reasons[payee];
  const reason = getReason( payee );

  expect( expectedReasons ).toContain( reason );
} );

describe( 'Reasons by type', () => {
  const generatedReasons = [];

  beforeEach( () => {
    const payee = 'TEST$VALUE';
    for ( let x = 0; x < 100; x++ ) {
      generatedReasons.push( getReason( payee ) );
    }
  } );

  test( 'Should return a general reason', () => {
    const foundReasons = generatedReasons.filter( ( r ) =>
      reasons.general.includes( r ),
    );
    expect( generatedReasons.length ).toBeGreaterThan( 1 );
    expect( foundReasons.length ).toBeGreaterThan( 1 );
  } );

  test( 'Should return a "$foo tickets" reason', () => {
    const ticketReasons = reasons.tickets.map( ( r ) => `${r} tickets` );
    const foundReasons = generatedReasons.filter( ( r ) =>
      ticketReasons.includes( r ),
    );
    expect( generatedReasons.length ).toBeGreaterThan( 1 );
    expect( foundReasons.length ).toBeGreaterThan( 1 );
  } );

  test( 'Should never return just "tickets"', () => {
    expect( generatedReasons.includes( 'tickets' ) ).toBeFalsy();
  } );

  test( 'Should include a "dinner at $foo" reason', () => {
    const dinnerReasons = reasons['dinner at'].map( ( r ) => `dinner at ${r}` );
    expect( generatedReasons.length ).toBeGreaterThan( 1 );
    expect( dinnerReasons.length ).toBeGreaterThan( 1 );
  } );

  test( 'Should never return just "dinner at"', () => {
    expect( generatedReasons.includes( 'dinner at' ) ).toBeFalsy();
  } );
} );
