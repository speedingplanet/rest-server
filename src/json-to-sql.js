const path = require( 'path' );
const _ = require( 'lodash' );
const fs = require( 'fs' );

const pathToData = '../data/generated/';
const labels = [ 'users', 'transactions' ];

// { jsPropName : sqlPropName}
// Ids are always numbers?
const mappings = {
  users: {
    displayName: { field: 'displayName', type: 'string' },
    zipPayId: { field: 'zipPayId', type: 'string' },
    email: { field: 'email', type: 'string' },
    userType: { field: 'userType', type: 'string' },
    id: { field: 'id', type: 'number' },
    lastUpdated: { field: 'lastUpdated', type: 'date' },
    version: { field: 'userVersion', type: 'number' },
    active: { field: 'active', type: 'boolean' },
    'address.street': { field: 'street', type: 'string' },
    'address.city': { field: 'city', type: 'string' },
    'address.state': { field: 'province', type: 'string' },
    'address.postalCode': { field: 'postalCode', type: 'string' },
    'address.country': { field: 'country', type: 'string' },
    'picture.large': { field: 'largeAvatar', type: 'string' },
    'picture.medium': { field: 'mediumAvatar', type: 'string' },
    'picture.thumbnail': { field: 'thumbnailAvatar', type: 'string' },
  },

  transactions: {
    id: { field: 'id', type: 'number' },
    payorId: { field: 'payorId', type: 'string' },
    payeeId: { field: 'payeeId', type: 'string' },
    amount: { field: 'amount', type: 'number' },
    txDate: { field: 'txDate', type: 'date' },
    txType: { field: 'txType', type: 'string' },
    txStatus: { field: 'txStatus', type: 'string' },
    reason: { field: 'reason', type: 'string' },
    visibility: { field: 'visibility', type: 'string' },
    lastUpdated: { field: 'lastUpdated', type: 'date' },
    active: { field: 'active', type: 'boolean' },
    version: { field: 'txVersion', type: 'number' },
  },
};

for ( const label of labels ) {
  const data = require( path.resolve( __dirname, pathToData, label + '.json' ) );
  const sql = generateSQL( label, data, mappings[label] );
  fs.writeFileSync(
    path.resolve( __dirname, pathToData, `${label}.sql` ),
    sql.join( '\n' ),
  );
}

function generateSQL( label, data, mappings ) {
  console.log( `There are ${data.length} ${label}.` );
  const sql = [];
  for ( const record of data ) {
    const fieldsAndValues = Object.keys( mappings ).reduce( ( fav, key ) => {
      const { field, type } = mappings[key];
      let value = _.get( record, key, null );
      if ( !value ) {
        return fav;
      }

      if ( type === 'number' ) {
        value = Number( value );
      } else if ( type === 'boolean' ) {
        value = Boolean( value );
      } else if ( type === 'date' ) {
        value = value.replace( 'Z', '' );
        value = value.replace( 'T', ' ' );
        value = `'${value}'`;
      } else if ( type === 'string' ) {
        value = value.replace( /'/g, "''" );
        value = `'${value}'`;
      }
      // console.log( `Setting ${field} to ${value}` );
      fav[field] = value;
      return fav;
    }, {} );

    // prettier-ignore
    // eslint-disable-next-line max-len
    const sqlTemplate = `insert into ${label.toUpperCase()} (${Object.keys( fieldsAndValues )}) VALUES (${Object.values( fieldsAndValues )});`;

    sql.push( sqlTemplate );
  }

  return sql;
}
