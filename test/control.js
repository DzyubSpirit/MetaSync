'use strict';

api.metatests.test('firstOf', (test) => {
  const returningFnIndex = 2;
  let dataReturned = false;

  const execUnlessDataReturned = (data) => (callback) => {
    if (dataReturned) {
      callback(null, data);
    } else {
      process.nextTick(execUnlessDataReturned);
    }
  };
  const makeIFn = (i) => (callback) => process.nextTick(() => {
    const iData = 'data' + i;
    if (i === returningFnIndex) {
      dataReturned = true;
      callback(null, iData);
    } else {
      execUnlessDataReturned(iData);
    }
  });

  const fns = [1, 2, 3].map(makeIFn);

  api.metasync.firstOf(fns, (err, data) => {


    test.error(err);
    test.strictSame(data, 'data2');
    test.end();
  });
});

api.metatests.test('parallel with error', (test) => {
  const parallelError = new Error('Parallel error');

  function fn1(data, cb) {
    process.nextTick(() => {
      cb(null, { data1: 'data 1' });
    });
  }

  function fn2(data, cb) {
    process.nextTick(() => {
      cb(parallelError);
    });
  }

  api.metasync.parallel([fn1, fn2], (err, res) => {
    test.strictSame(err, parallelError);
    test.strictSame(res, undefined);
    test.end();
  });
});

api.metatests.test('sequential with error', (test) => {
  const sequentialError = new Error('Sequential error');
  const expectedDataInFn2 = { data1: 'data 1' };

  function fn1(data, cb) {
    process.nextTick(() => {
      cb(null, { data1: 'data 1' });
    });
  }

  function fn2(data, cb) {
    process.nextTick(() => {
      test.same(data, expectedDataInFn2);
      cb(sequentialError);
    });
  }

  api.metasync.sequential([fn1, fn2], (err, res) => {
    test.strictSame(err, sequentialError);
    test.strictSame(res, undefined);
    test.end();
  });
});
