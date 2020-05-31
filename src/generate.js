// @ts-check
const path = require('path');
const meow = require('meow');
const { generateTransactions, generateUsers } = require('./generate-lib');

const _ = require('lodash');
const fs = require('fs-extra');

// ======================================================
//     Utility Functions
// ======================================================

function writeToFile(fileName, data) {
  fs.ensureDir(path.dirname(fileName)).then(() => {
    fs.writeJSON(fileName, data, { spaces: 2 })
      .then(() => console.log('generated to file: ', fileName))
      .catch((err) => console.error(err));
  });
}

// ======================================================
//     Program body
// ======================================================

const defaultCount = 100;

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
      count: {
        type: 'number',
        default: defaultCount,
        isMultiple: true,
      },
    },
  },
);

if (opts.input.length % 2) {
  console.error(
    'Wrong number of arguments. There should be an even number of arguments.',
  );
  process.exit(-1);
}

const types = ['users', 'transactions'];
const generate = {
  users: generateUsers,
  transactions: generateTransactions,
};

const args = new Map();

for (let x = 0; x < opts.input.length; x += 2) {
  const type = opts.input[x];

  // @ts-ignore
  if (!isNaN(type)) {
    console.error('Wrong type or argument in wrong position: ', type);
    process.exit(-1);
  }

  if (!types.includes(type)) {
    console.warn(`Incorrect type: "${type}". Skipping.`);
    continue;
  }

  const count = Number(opts.input[x + 1]);
  args.set(type, count);
}

if (args.has('users') && args.get('users') > args.get('transactions')) {
  console.error('More users than transactions, which is weird. Exiting.');
  process.exit(-1);
}

const output = {};

for (let [type, count] of args.entries()) {
  console.log('Generating ', type);

  if (type === 'transactions' && output['users'].length) {
    output[type] = generate[type](count, output['users']);
  } else {
    output[type] = generate[type](count);
  }

  if (opts.flags.toFiles) {
    writeToFile(`${__dirname}/../data/generated/${type}.json`, output[type]);
  }

  // console.log(type, output[type]);
}
