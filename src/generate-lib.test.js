const { getMaxId, generate, generateTransactions } = require('./generate-lib');
const seedUsers = require('../data/seeds/users.json');

test('finds the right max ID value', () => {
  const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
  const maxId = getMaxId(data);
  expect(maxId).toBe(3);
});

test('Assigns a number to the instance', () => {
  const spec = { count: 1 };
  const instance = generate(spec);
  expect(instance.count).toEqual(spec.count);
});

test('Assigns a string to the instance', () => {
  const spec = { name: 'John' };
  const instance = generate(spec);
  expect(instance.name).toEqual(spec.name);
});

test('Calls a function and assigns the value to the instance', () => {
  const spec = { id: () => 1 };
  const instance = generate(spec);
  expect(instance.id).toEqual(1);
});

test('If value is null, uses the custom provided value', () => {
  const spec = { foo: null };
  const custom = { foo: 'custom' };
  const instance = generate(spec, custom);
  expect(instance.foo).toEqual(custom.foo);
});

test("If the value is null and there is no custom, doesn't generate", () => {
  const spec = { foo: null, bar: 'bar' };
  const instance = generate(spec);
  expect(instance.bar).toEqual(spec.bar);
  expect(instance.foo).not.toBeDefined();
});

test('Recurses over a sub-value', () => {
  const spec = {
    id: () => 1,
    foo: null,
    bar: {
      baz: 10,
    },
  };
  const custom = { foo: 'custom' };
  const instance = generate(spec, custom);

  expect(instance.id).toEqual(1);
  expect(instance.foo).toEqual(custom.foo);
  expect(instance.bar.baz).toEqual(spec.bar.baz);
});

test('Some charges are paid (randomized)', () => {
  const transactions = generateTransactions(100);
  const charges = transactions.filter((tx) => tx.txType === 'charge');
  expect(charges.length).toBeGreaterThan(1);

  const paidCharges = charges.filter((charge) => charge.txStatus === 'settled');

  expect(paidCharges.length).toBeGreaterThan(1);

  const paidChargesCheck = paidCharges.every((charge) =>
    transactions.find((tx) => (tx.id = charge.txRef)),
  );
  expect(paidChargesCheck).toBeTruthy();
  // expect(paidCharges[0].txRef).toBeDefined();
  // expect(transactions.find((tx) => tx.id === paidCharges[0].txRef)).toBeTruthy();
});

test('Some charges are unpaid (randomized)', () => {
  const transactions = generateTransactions(100);
  const charges = transactions.filter((tx) => tx.txType === 'charge');
  expect(charges.length).toBeGreaterThan(0);

  const unpaidCharges = charges.filter((charge) => charge.txStatus === 'open');
  expect(unpaidCharges.length).toBeGreaterThan(0);

  const unpaidChargesCheck = unpaidCharges.every((charge) => !charge.txRef);
  expect(unpaidChargesCheck).toBeTruthy();
  // expect(unPaidCharges[0].txRef).not.toBeDefined();
});

test('All users have at least one payment', () => {
  const users = seedUsers.slice(0, 5);
  const transactions = generateTransactions(users.length, users);

  const everyResult = users.every((user) => {
    return transactions.find((t) => {
      return t.payorId === user.payeeId;
    });
  });

  expect(everyResult).toBeTruthy();
});
