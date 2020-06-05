const { getNextId } = require('./server');

test('Should find the highest id value', () => {
  const users = getTestData();
  const maxId = Number(users[users.length - 1].id);

  const foundMaxId = getNextId(users, 'id', 0);

  expect(foundMaxId).toEqual(maxId);
});

function getTestData() {
  return [
    {
      displayName: 'DCH Mortgages',
      payeeId: 'DCHM$101',
      email: 'info@dch-mortgages.com',
      address: {
        street: '1393 Caton St',
        city: 'Roxbury',
        state: 'CT',
        postalCode: '06783',
      },
      id: '101',
      version: 1,
      lastUpdated: '2020-05-07T19:31:42.232Z',
      active: true,
    },
    {
      displayName: 'Ill Communication Telephones',
      payeeId: 'BBOY$102',
      email: 'accounts@ill-comms.com',
      address: {
        street: '244 Grafton Ave',
        city: 'Longview',
        state: 'WA',
        postalCode: '98632',
      },
      id: '102',
      version: 1,
      lastUpdated: '2020-05-07T19:31:42.232Z',
      active: true,
    },
    {
      displayName: "Erol's Internet",
      payeeId: 'EROL$103',
      email: 'payments@erols.net',
      address: {
        street: '1237 Lee Pl',
        city: 'Mullan',
        state: 'ID',
        postalCode: '83846',
      },
      id: '103',
      version: 1,
      lastUpdated: '2020-05-07T19:31:42.232Z',
      active: true,
    },
    {
      displayName: 'Acme Products, Inc',
      payeeId: 'ACME$104',
      email: 'coyote@acme.com',
      address: {
        street: '330 Pollard Pl',
        city: 'Belle Chasse',
        state: 'LA',
        postalCode: '70037',
      },
      id: '104',
      version: 1,
      lastUpdated: '2020-05-07T19:31:42.232Z',
      active: true,
    },
    {
      displayName: 'Shop-Rite Grocery Store',
      payeeId: 'SHOP$105',
      email: 'info@shoprite.com',
      address: {
        street: '702 Colby St',
        city: 'Lehigh Acres',
        state: 'FL',
        postalCode: '33976',
      },
      id: '105',
      version: 1,
      lastUpdated: '2020-05-07T19:31:42.232Z',
      active: true,
    },
    {
      displayName: 'Sushi Land',
      payeeId: 'SUSH$106',
      email: 'jay@sushi-land.org',
      address: {
        street: '629 Beulah St',
        city: 'Hanston',
        state: 'KS',
        postalCode: '67849',
      },
      id: '106',
      version: 1,
      lastUpdated: '2020-05-07T19:31:42.232Z',
      active: true,
    },
  ];
}
