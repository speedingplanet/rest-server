// @ts-check
const zipcodes = require('zipcodes');
const _ = require('lodash');
const Chance = require('chance');
const dateFns = require('date-fns');
const streets = require('../data/seeds/streets.json');
const seedUsers = require('../data/seeds/users.json');
const seedCompanies = require('../data/seeds/companies.json');
const { getReason } = require('./reasons');

// Current problem: The spec is generated multiple times. It has to be generated once then re-used.

/*
 * A generator spec should be an object with keys and either exact values or
 * a function ref that can generate said values.
 *
 * const payee = {
 *   displayName: generatePayeeName,
 *   version: 1,
 *   active: true
 *   ...etc
 * }
 *
 * The generator function iterates over the key/value pairs in the spec, doing
 * the following:
 *
 * switch (typeof spec[key]) {
 *   case 'function':
 *     spec[key]()
 *     break;
 *   case 'object':
 *     recurse;
 *   case 'null' (yes, actually 'object'):
 *     if (null) // Has to be assigned based on other information, like a categoryId in payee
 *   default:
 *     return spec[key]
 *
 *
 */

/*
  TODO: 
  Options
    --files         generate out to <type>.json
    --prefix        generate out to <prefix>-<type>.json
    --dir           generate to a destination directory, otherwise data/
    --skip-seeds    don't generate output with seeds

  TODO: Corporations, generally, should not pay people
*/

// ======================================================
//     Utility Functions
// ======================================================

const chance = new Chance();

function getBetterAddress() {
  const address = zipcodes.random();

  // AP AE AA are military bases
  return address.state in ['AP', 'AE', 'AA'] ? zipcodes.random() : address;
}

function generateAddress() {
  const { city, state, zip } = getBetterAddress();
  const streetName = _.sample(streets);
  const streetNumber = _.random(1, 1500);
  return {
    street: `${streetNumber} ${streetName}`,
    city,
    state,
    postalCode: zip,
    country: 'USA',
  };
}

function generateTimeStampBetween(startDate, endDate) {
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  return new Date(_.random(startTime, endTime)).toISOString();
}

function sequenceGenerator(start = 0, prefix = '') {
  let nStart = Number(start);
  return function () {
    nStart++;
    return nStart + '';
  };
}

function getMaxId(data, field = 'id') {
  // Numerically sorted array
  return _.map(data, field).sort((a, b) => b - a)[0];
}

// ======================================================
//     Generators
// ======================================================

function generate(spec, custom) {
  let instance = {};
  const specKeys = Object.keys(spec);
  for (let key of specKeys) {
    switch (typeof spec[key]) {
      case 'function':
        instance[key] = spec[key](instance);
        break;
      case 'object':
        if (_.isNull(spec[key]) && custom && custom[key]) {
          instance[key] = custom[key];
        } else if (!_.isNull(spec[key])) {
          instance[key] = generate(spec[key], custom);
        }
        break;
      default:
        instance[key] = spec[key];
    }
  }

  return instance;
}

function generatePayeeId(displayName) {
  return (
    displayName.replace(/\s/, '').substring(0, 4).toUpperCase() +
    '$' +
    chance.hash({
      casing: 'upper',
      length: 4,
    })
  );
}

function generateUsers(count = 1) {
  const users = new Array(count);
  const today = new Date();

  const userProto = {
    displayName: '',
    payeeId: '',
    email: '',
  };

  const userSpec = {
    address: generateAddress,
    id: sequenceGenerator(getMaxId(seedUsers)),
    version: 1,
    lastUpdated: () => generateTimeStampBetween(dateFns.subYears(today, 1), today),
    active: true,
  };

  for (let x = 0; x < count; x++) {
    userProto.userType = chance.weighted(['person', 'corporation'], [4, 1]);
    if (userProto.userType === 'person') {
      userProto.displayName = chance.name();

      // TODO occasionally generate john@paxton.com
      userProto.email = `${userProto.displayName.replace(/\s/, '.')}@${_.sample([
        'gmail.com',
        'hotmail.com',
        'aol.com',
        'yahoo.com',
        'comcast.com',
      ])}`;
    } else if (userProto.userType === 'corporation') {
      userProto.displayName = _.sample(seedCompanies);
      userProto.email = `${_.sample(['accounts', 'info', 'payments'])}@${_.kebabCase(
        userProto.displayName,
      )}.${chance.weighted(['com', 'org', 'net', 'us'], [4, 1, 2, 1])}`;
    }
    userProto.payeeId = generatePayeeId(userProto.displayName);

    users[x] = generate({ ...userProto, ...userSpec });
  }

  const combinedUsers = [...seedUsers, ...users];

  // TODO: If the count is less than seedUsers, return a mix of seedUsers and generated users
  return combinedUsers.slice(0, count);
}

function notThisOne(item, array) {
  const sample = _.sample(array);
  return sample !== item ? sample : notThisOne(item);
}

function generateTransactions(count = 1, users = seedUsers) {
  if (!Array.isArray(users))
    console.error('Need an array of users to generate transactions');
  if (count < users.length) console.warn('Not every user will have a transaction');

  const today = new Date();
  const transactions = [];

  const txSpec = {
    id: sequenceGenerator(),
    payorId: (tx) => _.sample(users).payeeId,
    payeeId: (tx) => {
      return notThisOne(tx.payor, users).id;
    },
    txDate: () => generateTimeStampBetween(dateFns.subYears(today, 1), today),
    txType: () => chance.weighted(['payment', 'charge'], [4, 1]),
    txStatus: (tx) => {
      return tx.txType === 'payment' ? 'settled' : 'open';
    },
    reason: (tx) => getReason(tx.payorId),
    visibility: 'public',
    version: 1,
    lastUpdated: (tx) => tx.txDate,
    active: true,
  };

  // Every user should have paid at least once.
  for (let userCount = 0; userCount < Math.min(count, users.length); userCount++) {
    transactions[userCount] = generate({
      ...txSpec,
      payorId: users[userCount].payeeId,
      txType: 'payment',
    });
  }

  // console.log(`Initial users: There are ${transactions.length} transactions.`);
  // console.log(`Initial users: Transaction ids: ${transactions.map((tx) => tx.id)}`);

  if (count > users.length) {
    for (let x = users.length; x < count; x++) {
      transactions[x] = generate(txSpec);
      // console.log(`x is ${x}, transaction id is ${transactions[x].id}`);
    }
  }

  // console.log(`Remaining tx: There are ${transactions.length} transactions.`);
  // console.log(`Remaining tx: Transaction ids: ${transactions.map((tx) => tx.id)}`);

  // Process payments
  const charges = transactions.filter((tx) => tx.txType === 'charge');
  charges.forEach((charge) => {
    const spec = { ...txSpec };
    delete spec.txDate;

    if (_.random(1, 3) % 3 !== 0) {
      // @ts-ignore
      spec.txStatus = 'settled';

      const chargeTime = new Date(charge.txDate).getTime();
      let paymentTime = dateFns.addDays(chargeTime, _.random(1, 10)).getTime();
      paymentTime = Math.min(paymentTime, today.getTime());

      const payment = generate(spec);
      payment.txRef = charge.id;
      charge.txRef = payment.id;
      charge.txStatus = 'settled';
      charge.version = charge.version + 1;
      payment.txDate = payment.lastUpdated = new Date(paymentTime).toISOString();
      transactions.push(payment);

      // console.log('Charge id / txRef: ', charge.id, charge.txRef);
      // console.log('Payment id / txRef: ', payment.id, payment.txRef);
    }
  });

  return transactions;
}

module.exports = {
  generate,
  generatePayeeId,
  generateUsers,
  generateTransactions,
  getMaxId,
};
