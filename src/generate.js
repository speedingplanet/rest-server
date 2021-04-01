// @ts-check
const path = require( 'path' );
const meow = require( 'meow' );
const { generateTransactions, generateUsers } = require( './generate-lib' );

const fs = require( 'fs-extra' );
const prettier = require( 'prettier' );

// ======================================================
//     Utility Functions
// ======================================================

function writeToFile( fileName, data ) {
  let writePromise;
  if ( path.extname( fileName ) === '.json' ) {
    writePromise = fs.outputJSON( fileName, data, { spaces: 2 } );
  } else if ( path.extname( fileName ) === '.js' ) {
    const output = prettier.format( `export default ${JSON.stringify( data )}`,
      {
        singleQuote: true,
        jsxSingleQuote: false,
        trailingComma: 'all',
        printWidth: 90,
        parser: 'babel',
      } );
    writePromise = fs.outputFile( fileName, output );
  } else {
    Promise.reject( new Error( 'writeToFile failed!' ) );
  }
  return writePromise
    .then( () => console.log( 'generated to file: ', fileName ) );
}

// ======================================================
//     Program body
// ======================================================

const types = [ 'users', 'transactions' ];
const generate = {
  users: generateUsers,
  transactions: generateTransactions,
};

// @ts-ignore
if ( require.main === module ) {
  const opts = meow(
    `
  Usage: 
    $ generate <type> <amount> <type> <amount>... <options> 

  Types:
    users
    transactions

  Options:
    --toFiles dumps output to appropriate files
`,
    {
      flags: {
        toFiles: {
          type: 'boolean',
          default: false,
        },
      },
    },
  );

  if ( opts.input.length % 2 ) {
    console.error(
      'Wrong number of arguments. There should be an even number of arguments.',
    );
    process.exit( -1 );
  }

  const config = {
    types: {},
  };

  for ( let x = 0; x < opts.input.length; x += 2 ) {
    const type = opts.input[x];

    // @ts-ignore
    if ( !isNaN( type ) ) {
      console.error( 'Wrong type or argument in wrong position: ', type );
      process.exit( -1 );
    }

    if ( !types.includes( type ) ) {
      console.warn( `Incorrect type: "${type}". Skipping.` );
      continue;
    }

    const count = Number( opts.input[x + 1] );
    config.types[type] = count;
  }

  if ( config.types.users && config.types.users > config.types.transactions ) {
    console.error( 'More users than transactions, which is weird. Exiting.' );
    process.exit( -1 );
  }

  if ( opts.flags.toFiles ) {
    config.toFiles = true;
  }

  generateData( config );
}

/*
 * config = {
 *   types: {
 *     users: number users | array of users | path to users file
 *     transactions: number of transactions,
 *   }
 *   toFiles: write to file? default false
 */

async function generateData( config ) {
  const output = {};

  if ( config.types.users ) {
    console.log( 'Generating users....' );
    if ( typeof config.types.users === 'number' ) {
      output.users = generate.users( config.types.users );
    } else if ( typeof config.types.users === 'string' ) {
      try {
        output.users = await fs.readJSON( config.types.users );
      } catch ( error ) {
        console.error( `Could not read users input file ${config.types.users}:`, error );
        throw new Error( error );
      }
    }
  }

  if ( config.types.transactions ) {
    console.log( 'Generating transactions' );
    if ( !Array.isArray( output.users ) ) {
      console.warn( 'No users passed in, using ONLY seedUsers' );
    }

    output.transactions = generate.transactions(
      config.types.transactions,
      output.users,
    );
  }

  if ( config.toFiles ) {
    try {
      Promise.all(
        Object.keys( output ).flatMap( ( type ) => {
          console.log( `Writing to ${type}.json` );
          // writeToFile( `${__dirname}/../data/generated/${type}.json`, output[type] );
          return [
            writeToFile( path.join( __dirname, '..', 'data', 'generated', `${type}.json` ), output[type] ),
            writeToFile( path.join( __dirname, '..', 'data', 'generated', `${type}.js` ), output[type] ),
          ];
        } ),
      );
    } catch ( error ) {
      console.error( `Could not write to file ${error.fileName} because `, error.error );
      throw new Error( error );
    }
  }

  return output;
}

module.exports = {
  generateData,
};
