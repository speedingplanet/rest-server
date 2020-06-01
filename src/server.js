#!/usr/bin/env node

const path = require('path');
const jsonServer = require('json-server');
const chalk = require('chalk');
const fs = require('fs-extra');
const meow = require('meow');

const { generateData } = require('./generate');
const serverConfig = require('./server-config.json');

const data = {};

async function generate() {
  try {
    return await generateData({
      toFiles: true,
      types: {
        users: 50,
        transactions: 1000,
      },
    });
  } catch (error) {
    console.error('Could not generate data because ', error);
  }
}

async function main(config) {
  const { port } = config;
  const dataDir = serverConfig.dataDir;
  const usersFile = path.join(__dirname, dataDir, 'users.json');
  const txFile = path.join(__dirname, dataDir, 'transactions.json');
  let data = {};

  try {
    data.users = await fs.readJSON(usersFile);
    data.transactions = await fs.readJSON(txFile);
  } catch (error) {
    console.error('Could not load data for server because ', error);
    console.error(chalk.red.bold('Maybe try "rest-server generate" ?'));
    throw new Error(error);
  }

  const endpoint = 'zippay';
  const { version, resources } = serverConfig.endpoints[endpoint];
  const apiUrl = `/api/${endpoint}/v${version}`;
  const dataFile = `${endpoint}-data.json`;
  const dataRoutes = path.join(__dirname, dataDir, dataFile);

  await fs.writeJSON(dataRoutes, data, { spaces: 2 });

  const server = jsonServer.create();
  server.set('views', path.join(__dirname, '../views/'));
  server.set('view engine', 'pug');
  const router = jsonServer.router(dataRoutes);
  const middlewares = jsonServer.defaults();
  server.get('/', (req, res) => {
    res.render('index', { baseUrl: apiUrl, resources });
  });

  server.use(middlewares);
  server.use(apiUrl, router);
  server.listen(port, () => {
    console.log(`Speeding Planet REST server is running`);
    console.log(chalk.underline.bold.green(`\thttp://localhost:${port}/`));
    console.log(chalk.underline.bold.green(`\thttp://0.0.0.0:${port}/`));
  });
}

if (require.main === module) {
  const cli = meow(`
  Usage
    $ rest-server <command> <options>

  Command
    start       Start the server
    generate    Generate data for the server
  
  Options
    --port Specify a custom port, defaults to 8000
  `);

  const port = cli.flags.port || serverConfig.port;

  if (cli.input[0] === 'start') {
    main({ port });
  } else if (cli.input[0] === 'generate') {
    generate();
  } else {
    console.warn('Run with either "generate" or "start".');
  }
}

module.exports = { serverStart: main };
