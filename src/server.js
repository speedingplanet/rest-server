/* eslint-disable */
const path = require('path');
const jsonServer = require('json-server');
const chalk = require('chalk');
const fs = require('fs-extra');

const serverConfig = require('./server-config.json');

const port = 8000;
const dataDir = '../data/generated';

const endpoint = 'zippay';
const { version, resources } = serverConfig.endpoints[endpoint];
const apiUrl = `/api/v${version}/${endpoint}`;
const dataFile = `${endpoint}-data.json`;
const dataRoutes = path.join(__dirname, dataDir, dataFile);

const data = {};

async function main() {
  await Promise.all(
    resources.map((r) => {
      return fs
        .readJSON(path.join(__dirname, dataDir, `${r}.json`))
        .then((resourceData) => (data[r] = resourceData));
    }),
  );
  await fs.writeJSON(dataRoutes, data, { spaces: 2 });

  const server = jsonServer.create();
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

main();

// TODO: Add urls for discoverability
