const assert = require('assert');
const vm = require('vm');

var mapGlobalVars = new Map();
var mapCommands = new Map();
var objExportData = {};

class TestError extends Error {
  constructor (message) {
    super(message);
    this.name = 'TestError';
  }
}

var tester = {
  get: (value) => {
    return process.env[value] || mapGlobalVars.get(value);
  },

  set: (key, value) => {
    mapGlobalVars.set(key, value);
  },

  use: (commands) => {
    let lstCommands = Array.isArray(commands) ? commands : [commands];
    lstCommands.forEach(command => { mapCommands.set(command.name, command); });
  },

  beforeTest: (fn) => {
    before(fn);
  },

  afterTest: (fn) => {
    after(fn);
  },

  test: (testcases) => {
    let lstTestcases = Array.isArray(testcases) ? testcases : [testcases];
    lstTestcases.forEach((testcase) => {
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
    testGroup.testcases.forEach((testcase) => {
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
    it.skip(testcase.test);
    return;
  }

  it(testcase.test, async function () {
    let command = mapCommands.get(testcase.command).command;

    await command(evaluateValue(testcase.inputData, objExportData))
      .then((outputData) => {
        generateAssert(testcase, outputData);

        if (testcase.exportData) {
          if (!testcase.exportData.match(/^[A-Za-z_]\w*$/i)) throw new TestError(`exportData ${JSON.stringify(testcase.exportData)} is invalid`);

          objExportData['$' + testcase.exportData] = outputData;
        }
      })
      .catch((err) => {
        if (err instanceof assert.AssertionError || err instanceof TestError) throw err;

        generateAssert(testcase, err);
      });
  });
}

function generateAssert (testcase, outputData) {
  let lstExpectedData = Array.isArray(testcase.expectedData) ? testcase.expectedData : [testcase.expectedData];
  lstExpectedData.forEach((expectedData) => {
    if (expectedData.assert === 'equal') {
      assert.deepStrictEqual(evaluateOutputData(expectedData.key, outputData), evaluateValue(expectedData.value, objExportData), expectedData.message);
    } else if (expectedData.assert === 'notEqual') {
      assert.notDeepStrictEqual(evaluateOutputData(expectedData.key, outputData), evaluateValue(expectedData.value, objExportData), expectedData.message);
    } else if (expectedData.assert === 'undefined') {
      assert.deepStrictEqual(evaluateOutputData(expectedData.key, outputData), undefined, expectedData.message);
    } else if (expectedData.assert === 'notUndefined') {
      assert.notDeepStrictEqual(evaluateOutputData(expectedData.key, outputData), undefined, expectedData.message);
    } else if (expectedData.assert === 'greater') {
      assert.ok(evaluateOutputData(expectedData.key, outputData) > evaluateValue(expectedData.value, objExportData), expectedData.message);
    } else if (expectedData.assert === 'less') {
      assert.ok(evaluateOutputData(expectedData.key, outputData) < evaluateValue(expectedData.value, objExportData), expectedData.message);
    } else if (expectedData.assert === 'typeof') {
      assert.strictEqual(typeof evaluateOutputData(expectedData.key, outputData), evaluateValue(expectedData.value, objExportData), expectedData.message);
    } else if (expectedData.assert === 'ok') {
      if (outputData instanceof Error) {
        assert.fail(expectedData.message || 'Error');
      } else {
        assert.ok(true);
      }
    } else if (expectedData.assert === 'error') {
      assert.ok(outputData instanceof Error, expectedData.message);
      if (expectedData.key === undefined) {
        assert.strictEqual(outputData.message || undefined, evaluateValue(expectedData.value, objExportData), expectedData.message);
      } else {
        assert.deepStrictEqual(evaluateOutputData(expectedData.key, outputData), evaluateValue(expectedData.value, objExportData), expectedData.message);
      }
    } else {
      throw new TestError(`expectedData.assert ${JSON.stringify(expectedData.assert)} is not recognized`);
    }
  });
}

function evaluateOutputData (key, outputData) {
  if (key === undefined) return outputData;

  if (typeof key !== 'string') throw new TestError(`expectedData.key ${JSON.stringify(key)} is invalid`);

  let outputDataKey = (key.indexOf('$outputData') === -1) ? '$outputData["' + key + '"]' : key;
  try {
    return evaluateValue(outputDataKey, { '$outputData': outputData });
  } catch (err) {
    throw new TestError(`expectedData.key ${JSON.stringify(key)} cannot be evaluated`);
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

    let lstMatchedExport = obj.match(/\$\w*/gi);
    lstMatchedExport.forEach((item) => {
      if (!sourceData.hasOwnProperty(item)) throw new TestError(`exportData ${JSON.stringify(item)} is undefined`);
    });

    let sandbox = { source: sourceData };
    try {
      vm.runInNewContext('evaledExportValue = source.' + obj, sandbox);
      return sandbox.evaledExportValue;
    } catch (err) {
      throw new TestError(`expectedData.value ${JSON.stringify(obj)} cannot be evaluated`);
    }
  }
  return obj;
}

module.exports = tester;
