const assert = require('assert');
const tester = require('./tester.js');

describe('tester.get', function () {
  it('get $HOME', function () {
    assert.notStrictEqual(tester.get('HOME'), undefined);
  });
});

describe('tester.set', function () {
  it('set { foo: bar }', function () {
    assert.doesNotThrow(() => tester.set('foo', 'bar'));
  });

  it('get foo }', function () {
    assert.strictEqual(tester.get('foo'), 'bar');
  });
});

let beforeCalled = false;
tester.beforeTest(async () => {
  beforeCalled = true;
});
before(function () {
  assert.ok(beforeCalled);
  console.log('**tester.beforeTest OK');
});

let afterCalled = false;
tester.afterTest(async () => {
  afterCalled = true;
});
after(function () {
  assert.ok(afterCalled);
  console.log('**tester.afterTest OK');
});

tester.use({
  name: 'general',
  command: async (inputData) => {
    return inputData;
  }
});

tester.use([
  {
    name: 'error',
    command: async (inputData) => {
      throw new Error(inputData);
    }
  }
]);

tester.test([
  {
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
        test: 'undefined',
        command: 'general',
        expectedData: { assert: 'undefined' }
      },
      {
        test: 'notUndefined',
        command: 'general',
        inputData: { foo: 'bar' },
        expectedData: { assert: 'notUndefined' }
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
        expectedData: [
          { assert: 'typeof', value: 'object' },
          { assert: 'typeof', key: 'foo', value: 'string' }
        ]
      },
      {
        test: 'ok',
        command: 'general',
        expectedData: { assert: 'ok' }
      },
      {
        description: 'error',
        testcases: [
          {
            test: 'error (any)',
            command: 'error',
            inputData: 'error foo',
            expectedData: { assert: 'error' }
          },
          {
            test: 'error (match message)',
            command: 'error',
            inputData: 'error foo',
            expectedData: { assert: 'error', value: 'error foo' }
          }
        ]
      }
    ]
  }
]);

tester.test([
  {
    description: 'tester.test (exportData)',
    testcases: [
      {
        test: 'export',
        command: 'general',
        inputData: { foo: 'bar' },
        expectedData: { assert: 'ok' },
        exportData: 'output'
      },
      {
        test: 'export to inputData',
        command: 'general',
        inputData: '$output.foo',
        expectedData: { assert: 'equal', value: 'bar' }
      },
      {
        test: 'export to expectedData.value',
        command: 'general',
        inputData: 'bar',
        expectedData: { assert: 'equal', value: '$output.foo' }
      },
      {
        test: 'export (advance)',
        command: 'general',
        inputData: ['$output', { foo: '$output.foo' }],
        expectedData: { assert: 'equal', value: ['$output', { foo: '$output.foo' }] }
      }
    ]
  }
]);

tester.test({
  test: 'tester.skip',
  command: 'general',
  inputData: { foo: 'bar' },
  expectedData: { assert: 'equal', value: { foo: 'bar' } },
  skip: true
});

tester.test({
  description: 'error cases',
  testcases: [
    {
      test: 'invalid expectedData.assert #error_ok',
      command: 'general',
      expectedData: { assert: 'some_assert' }
    },
    {
      test: 'invalid exportData #error_ok',
      command: 'general',
      inputData: { foo: 'bar' },
      expectedData: { assert: 'ok' },
      exportData: '1output'
    },
    {
      test: 'undefined exportData #error_ok',
      command: 'general',
      inputData: '$1output',
      expectedData: { assert: 'ok' }
    },
    {
      test: 'invalid evaluation #error_ok',
      command: 'general',
      inputData: '$output()',
      expectedData: { assert: 'ok' }
    },
    {
      test: 'error on assert.ok #error_ok',
      command: 'error',
      inputData: 'error foo',
      expectedData: { assert: 'ok' }
    },
    {
      test: 'non error on assert.error #error_ok',
      command: 'general',
      inputData: { foo: 'bar' },
      expectedData: { assert: 'error' }
    },
    {
      test: 'error message #error_ok',
      command: 'error',
      inputData: 'error foo',
      expectedData: { assert: 'equal', message: 'some message' }
    }
  ]
});

afterEach(function () {
  if (this.currentTest.title.indexOf('#error_ok') > -1 && this.currentTest.state === 'passed') {
    console.error(new Error('**Passed is not ok'));
  }
});
