const data = require( '../data/seeds/reasons.json' );
const _ = require( 'lodash' );

function getReason( key ) {
  if ( Array.isArray( data[key] ) ) {
    return _.sample( data[key] );
  }

  const keys = Object.keys( data ).filter( ( key ) => key.indexOf( '$' ) === -1 );
  const reasonType = _.sample( keys );

  switch ( reasonType ) {
  case 'dinner at':
    return `dinner at ${_.sample( data[reasonType] )}`;
  case 'tickets':
    return `${_.sample( data[reasonType] )} tickets`;
  default:
    return _.sample( data[reasonType] );
  }
}

module.exports = {
  getReason,
};
