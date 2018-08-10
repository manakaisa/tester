const assert = require('assert');
const vm = require('vm');

var mapGlobalVars = new Map();
var mapCommands = new Map();
var objExportData = {};

class TestError extends Error {
  constructor (...args) {
    super(...args);
    this.name = 'TestError';
  }
}

var tester = {
  get: function (value) {
    return process.env[value] || mapGlobalVars.get(value);
  },

  set: function (key, value) {
    mapGlobalVars.set(key, value);
  },

  use: function (commands) {
    let lstCommands = Array.isArray(commands) ? commands : [commands];
    lstCommands.forEach(command => { mapCommands.set(command.name, command); });
  },

  beforeTest: function (fn) {
    before(done => { fn(done); });
  },

  afterTest: function (fn) {
    after(done => { fn(done); });
  },

  test: function (testcases) {
    let lstTestcases = Array.isArray(testcases) ? testcases : [testcases];
    lstTestcases.forEach(function (testcase) {
      if (testcase.description) {
        generateDescription(testcase);
      } else {
        generateTest(testcase);
      }
    });
  }
};

function generateDescription (testGroup) {
  describe(testGroup.description, function () {
    testGroup.testcases.forEach(function (testcase) {
      if (testcase.description) {
        generateDescription(testcase);
      } else {
        generateTest(testcase);
      }
    });
  });
}

function generateTest (testcase) {
  if (testcase.skip) {
    it.skip(testcase.test, () => { assert.ok(true); });
    return;
  }

  it(testcase.test, function (done) {
    let command = mapCommands.get(testcase.command).command;
    try {
      command(evaluateValue(testcase.inputData, objExportData), function (err, outputData) {
        if (err) throw err;

        generateAssert(testcase, outputData);

        if (testcase.exportData) {
          objExportData['$' + testcase.exportData] = outputData;
        }

        done();
      });
    } catch (err) {
      if (err instanceof assert.AssertionError || err instanceof TestError) throw err;

      generateAssert(testcase, err);
      done();
    }
  });
}

function generateAssert (testcase, outputData) {
  if (!testcase.expectedData) throw new TestError(`require expectedData`);

  let lstExpectedData = Array.isArray(testcase.expectedData) ? testcase.expectedData : [testcase.expectedData];
  lstExpectedData.forEach(function (expectedData) {
    let evaledOutputValue = evaluateOutputData(expectedData.key, outputData);
    let evaledExpectedValue = evaluateValue(expectedData.value, objExportData);
    if (expectedData.assert === 'equal') {
      assert.deepStrictEqual(evaledOutputValue, evaledExpectedValue, expectedData.message);
    } else if (expectedData.assert === 'notEqual') {
      assert.notDeepStrictEqual(evaledOutputValue, evaledExpectedValue, expectedData.message);
    } else if (expectedData.assert === 'greater') {
      assert.ok(evaledOutputValue > evaledExpectedValue, expectedData.message);
    } else if (expectedData.assert === 'less') {
      assert.ok(evaledOutputValue < evaledExpectedValue, expectedData.message);
    } else if (expectedData.assert === 'typeof') {
      assert.strictEqual(typeof evaledOutputValue, evaledExpectedValue, expectedData.message);
    } else if (expectedData.assert === 'ok') {
      assert.ok(true);
    } else if (expectedData.assert === 'error') {
      assert.ok(outputData instanceof Error, expectedData.message);
      if (!expectedData.key) {
        assert.strictEqual(outputData.message || undefined, evaledExpectedValue, expectedData.message);
      } else {
        assert.deepStrictEqual(evaledOutputValue, evaledExpectedValue, expectedData.message);
      }
    } else {
      throw new TestError(`expectedData.assert ${JSON.stringify(expectedData.assert)} is not recognized`);
    }
  });
}

function evaluateOutputData (key, outputData) {
  if (!key) return outputData;

  if (typeof key !== 'string') throw new TestError('expectedData.key is invalid');

  try {
    let outputDataKey = (key.indexOf('$outputData') === -1) ? '$outputData.' + key : key;
    return evaluateValue(outputDataKey, {'$outputData': outputData});
  } catch (err) {
    throw new TestError(`${JSON.stringify(key)} cannot be evaluated`);
  }
}

function evaluateValue (obj, sourceData) {
  if (obj && typeof obj === 'object') {
    for (var prop in obj) {
      obj[prop] = evaluateValue(obj[prop], sourceData);
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => { obj[index] = evaluateValue(item, sourceData); });
  } else if (typeof obj === 'string') {
    if (obj.indexOf('$') === -1) return obj;

    // Todo: check existing

    let sandbox = { source: sourceData };
    try {
      vm.runInNewContext('evaledExportValue = source.' + obj, sandbox);
      return sandbox.evaledExportValue;
    } catch (err) {
      throw new TestError(`${JSON.stringify(obj)} cannot be evaluated`);
    }
  }
  return obj;
}

module.exports = tester;
