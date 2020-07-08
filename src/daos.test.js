import { dao } from './daos.js';

describe('DAO tests with a failed response', () => {
  test('It should return http status >399 as success', () => {
    const httpError = {
      status: 404,
      body: JSON.stringify([]),
    };
    fetchMock.mockResponseOnce(() => Promise.resolve(httpError));

    return dao.findAllTransactions().then((res) => {
      expect(res.response.status).toEqual(httpError.status);
      expect(res.data).toEqual([]);
    });
  });

  test('It should handle poorly formed JSON', () => {
    fetchMock.mockResponseOnce(() => {
      let data = JSON.stringify(['one']);
      data = data.slice(0, -1);
      return Promise.resolve({ body: data });
    });

    return dao.findAllTransactions().catch((error) => {
      expect(error).toBeDefined();
      expect(error.error.text).toEqual('DAO Error');
      expect(error.error.code).toBe(-1);
    });
  });
});

describe('Cancel functionality', () => {
  beforeEach(() => {
    fetch.resetMocks();
    fetch.doMock();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('rejects when aborted before resolved', async () => {
    const c = dao.getAbortController();
    fetch.mockResponse(async () => {
      jest.advanceTimersByTime(60);
      return '';
    });
    setTimeout(() => c.abort(), 50);
    await expect(dao.findAllUsers({ signal: c.signal })).rejects.toThrow();
  });

  it('does not reject when aborted after resolved', async () => {
    const c = dao.getAbortController();
    fetch.mockResponse(async () => {
      jest.advanceTimersByTime(60);
      return '';
    });
    setTimeout(() => c.abort(), 75);
    await expect(dao.findAllUsers({ signal: c.signal })).rejects.not.toThrow();
  });
});
