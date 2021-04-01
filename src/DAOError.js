export class DAOError extends Error {
  constructor( response, message = 'Unspecified DAO Error' ) {
    super( message );

    if ( Error.captureStackTrace ) {
      Error.captureStackTrace( this, DAOError );
    }
    this.name = 'DAOError';
    this.response = response;
  }
}
