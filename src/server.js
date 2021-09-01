#!/usr/bin/env node

const path = require( 'path' );
const jsonServer = require( 'json-server' );
const chalk = require( 'chalk' );
const fs = require( 'fs-extra' );
const meow = require( 'meow' );

const { generateData } = require( './generate' );
const { generateZipPayId } = require( './generate-lib' );
const serverConfig = require( './server-config.json' );

const dataDir = serverConfig.dataDir;
const dataDirFull = path.join( __dirname, dataDir );

async function generate() {
  try {
    return await generateData( {
      toFiles: true,
      types: {
        users: 50,
        transactions: 1000,
      },
    } );
  } catch ( error ) {
    console.error( 'Could not generate data because ', error );
  }
}

function getNextId( array, idField = 'id', offset = 1 ) {
  const currentMaxId = array.reduce(
    ( max, current ) =>
      Number( current[idField] ) > max ? Number( current[idField] ) : max,
    0,
  );

  return currentMaxId + offset;
}

async function main( config ) {
  const { port } = config;
  const usersFile = path.join( dataDirFull, 'users.json' );
  const txFile = path.join( dataDirFull, 'transactions.json' );
  const data = {};

  try {
    data.users = await fs.readJSON( usersFile );
    data.transactions = await fs.readJSON( txFile );
  } catch ( error ) {
    console.error( 'Could not load data for server because ', error );
    console.error( chalk.red.bold( 'Maybe try "rest-server generate" ?' ) );
    throw new Error( error );
  }

  data.config = {
    users: {
      get nextId() {
        return getNextId( data.users );
      },
    },
    transactions: {
      get nextId() {
        return getNextId( data.transactions );
      },
    },
  };

  const endpoint = 'zippay';
  const { version, resources } = serverConfig.endpoints[endpoint];
  const apiUrl = `/api/${endpoint}/v${version}`;
  const dataFile = `${endpoint}-data.json`;
  const dataRoutes = path.join( __dirname, dataDir, dataFile );

  await fs.writeJSON( dataRoutes, data, { spaces: 2 } );

  const server = jsonServer.create();
  server.set( 'views', path.join( __dirname, '../views/' ) );
  server.engine( 'pug', require( 'pug' ).__express );
  server.set( 'view engine', 'pug' );
  const router = jsonServer.router( data );
  const middlewares = jsonServer.defaults();
  server.get( '/', ( req, res ) => {
    res.render( 'index', { baseUrl: apiUrl, resources } );
  } );

  server.use( middlewares );

  server.use( jsonServer.bodyParser );
  server.use( ( req, res, next ) => {
    if ( req.method === 'POST' ) {
      if ( req.path.endsWith( 'users' ) ) {
        req.body.id = data.config.users.nextId;
        req.body.payeeId = generateZipPayId( req.body.displayName );
      } else if ( req.path.endsWith( 'transactions' ) ) {
        req.body.id = data.config.transactions.nextId;
      }
      req.body.version = 1;
      req.body.lastUpdated = new Date().toISOString();
      req.body.active = true;
    }

    next();
  } );

  server.use( apiUrl, router );
  server.listen( port, () => {
    console.log( 'Speeding Planet REST server is running' );
    console.log( chalk.underline.bold.green( `\thttp://localhost:${port}/` ) );
    console.log( chalk.underline.bold.green( `\thttp://0.0.0.0:${port}/` ) );
  } );
}

if ( require.main === module ) {
  const cli = meow( `
  Usage
    $ rest-server <command> <options>

  Command
    start       Start the server
    generate    Generate data for the server
    clean       Wipe out generated data
  
  Options
    --port Specify a custom port, defaults to 8000
  ` );

  const port = cli.flags.port || serverConfig.port;

  if ( cli.input[0] === 'start' ) {
    main( { port } );
  } else if ( cli.input[0] === 'generate' ) {
    generate();
  } else if ( cli.input[0] === 'clean' ) {
    fs.remove( dataDirFull )
      .then( () => console.log( 'Cleaned ', dataDirFull ) )
      .catch( ( err ) => console.error( 'Could not clean data dir because ', err ) );
  } else {
    console.warn( 'Run with either "generate" or "start".' );
  }
}

module.exports = { serverStart: main, getNextId };
