const assert = require('assert');

var mapGlobalVars = new Map();
var mapCommands = new Map();

var tester = {
  get: function (value) {
    return process.env[value] || mapGlobalVars.get(value);
  },

  set: function (key, value) {
    mapGlobalVars.set(key, value);
  },

  use: function (commands) {
    let lstCommands = (commands instanceof Array) ? commands : [commands];
    lstCommands.forEach(command => { mapCommands.set(command.name, command); });
  },

  beforeTest: function (fn) {
    before(done => { fn(done); });
  },

  afterTest: function (fn) {
    after(done => { fn(done); });
  },

  test: function (testcases) {
    let lstTestcases = (testcases instanceof Array) ? testcases : [testcases];
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
  } else {
    it(testcase.test, function (done) {
      let command = mapCommands.get(testcase.command).command;
      // Todo: catch error, exportData
      command(evaluateValue(testcase.inputData), function (err, outputData) {
        if (err) {
          generateAssert(testcase, err);
        } else {
          generateAssert(testcase, outputData);
        }
        done();
      });
    });
  }
}

function generateAssert (testcase, outputData) {
  let lstExpectedData = (testcase.expectedData instanceof Array) ? testcase.expectedData : [testcase.expectedData];
  // Todo: evaluate key
  let evaledOutputValue = evaluateValue(outputData);
  lstExpectedData.forEach(function (expectedData) {
    let evaledExpectedValue = evaluateValue(expectedData.value);
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
      assert.ok(true, expectedData.message);
    } else if (expectedData.assert === 'error') {
      // Todo
    } else {
      throw new Error('expectedData.assert ' + JSON.stringify(expectedData.assert) + ' is not recognized');
    }
  });
}

function evaluateValue (value) {
  // Dummy
  return value;
}

module.exports = tester;
