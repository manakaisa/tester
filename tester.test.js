const assert = require('assert');
const tester = require('./tester.js');

describe('tester.get', function () {
  it('get $HOME', function () {
    assert.notStrictEqual(tester.get('HOME'), undefined);
  });
});

describe('tester.set', function () {
  it('set { key: foo, value: bar }', function () {
    assert.doesNotThrow(() => tester.set('foo', 'bar'));
  });

  it('get { key: foo }', function () {
    assert.strictEqual(tester.get('foo'), 'bar');
  });
});

let beforeCalled = false;
tester.beforeTest((done) => {
  beforeCalled = true;
  done();
});
before(function () {
  assert.ok(beforeCalled);
  console.log('**tester.beforeTest OK');
});

let afterCalled = false;
tester.afterTest((done) => {
  afterCalled = true;
  done();
});
after(function () {
  assert.ok(afterCalled);
  console.log('**tester.afterTest OK');
});

tester.use({
  name: 'general',
  command: function (inputData, done) {
    done(null, inputData);
  }
});

tester.use([
  {
    name: 'error1',
    command: function (inputData, done) {
      done(new Error(inputData));
    }
  },
  {
    name: 'error2',
    command: function (inputData, done) {
      throw new Error(inputData);
    }
  }
]);

tester.test({
  description: 'tester.test (assert)',
  testcases: [
    {
      test: 'equal',
      command: 'general',
      inputData: { foo: 'bar' },
      expectedData: { assert: 'equal', value: { foo: 'bar' } }
    },
    {
      test: 'notEqual',
      command: 'general',
      inputData: { foo: 'bar' },
      expectedData: { assert: 'notEqual', value: { foo: 'other' } }
    },
    {
      test: 'greater',
      command: 'general',
      inputData: 0,
      expectedData: { assert: 'greater', value: -1 }
    },
    {
      test: 'less',
      command: 'general',
      inputData: 0,
      expectedData: { assert: 'less', value: 1 }
    },
    {
      test: 'typeof',
      command: 'general',
      inputData: { foo: 'bar' },
      expectedData: { assert: 'typeof', value: 'object' }
    },
    {
      description: 'error',
      testcases: [
        {
          test: 'error (any)',
          command: 'error1',
          expectedData: { assert: 'error' }
        },
        {
          test: 'error (match message)',
          command: 'error2',
          inputData: 'error foo',
          expectedData: { assert: 'error', value: 'error foo' }
        }
      ]
    },
    {
      test: 'ok',
      command: 'general',
      expectedData: { assert: 'ok' }
    }
  ]
});

tester.test([
  {
    description: 'tester.test (expectedData)',
    testcases: [
      {
        test: '[expectedData]',
        command: 'general',
        inputData: { foo: 'bar' },
        expectedData: [
          { assert: 'typeof', value: 'object' },
          { assert: 'equal', value: { foo: 'bar' } }
        ]
      },
      {
        test: 'expectedData.key',
        command: 'general',
        inputData: { foo: 'bar' },
        expectedData: { assert: 'equal', key: 'foo', value: 'bar' }
      }
    ]
  }
]);

tester.test([
  {
    description: 'tester.test (exportData)',
    testcases: [
      {
        test: 'exportData',
        command: 'general',
        inputData: { foo: 'bar' },
        expectedData: { assert: 'ok' },
        exportData: 'output'
      },
      {
        test: 'exportData to inputData',
        command: 'general',
        inputData: '$output.foo',
        expectedData: { assert: 'equal', value: 'bar' }
      },
      {
        test: 'exportData to expectedData.value',
        command: 'general',
        inputData: 'bar',
        expectedData: { assert: 'equal', value: '$output.foo' }
      }
    ]
  }
]);

tester.test([
  {
    test: 'tester.skip',
    command: 'general',
    inputData: { foo: 'bar' },
    expectedData: { assert: 'equal', value: { foo: 'bar' } },
    skip: true
  }
]);

tester.test([
  {
    test: 'invalid expectedData',
    command: 'general'
  },
  {
    test: 'invalid expectedData.assert',
    command: 'general',
    expectedData: { assert: 'some_assert' }
  },
  {
    test: 'invalid evaluation',
    command: 'general',
    inputData: '$output some',
    expectedData: { assert: 'ok' }
  },
  {
    test: 'application error',
    command: 'error1',
    inputData: { foo: 'bar' },
    expectedData: { assert: 'equal', value: { foo: 'bar' } }
  },
  {
    test: 'error message',
    command: 'general',
    inputData: { foo: 'bar' },
    expectedData: { assert: 'equal', value: { foo: 'other' }, message: 'test error message' }
  }
]);
