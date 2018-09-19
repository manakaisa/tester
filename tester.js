const assert = require('assert');
const vm = require('vm');

var mapGlobals = new Map();
var mapCommands = new Map();
var objExportData = {};

class TestError extends Error {
  constructor (message) {
    super(message);
    this.name = 'TestError';
  }
}

var tester = {
  get: (key) => {
    return (mapGlobals.has(key)) ? mapGlobals.get(key) : process.env[key];
  },

  set: (key, value) => {
    mapGlobals.set(key, value);
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
  if (testcase.skip === true) {
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

        generateAssertForError(testcase, err);
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
      assert.strictEqual(evaluateOutputData(expectedData.key, outputData), undefined, expectedData.message);
    } else if (expectedData.assert === 'notUndefined') {
      assert.notStrictEqual(evaluateOutputData(expectedData.key, outputData), undefined, expectedData.message);
    } else if (expectedData.assert === 'greater') {
      assert.ok(evaluateOutputData(expectedData.key, outputData) > evaluateValue(expectedData.value, objExportData), expectedData.message);
    } else if (expectedData.assert === 'less') {
      assert.ok(evaluateOutputData(expectedData.key, outputData) < evaluateValue(expectedData.value, objExportData), expectedData.message);
    } else if (expectedData.assert === 'typeof') {
      assert.strictEqual(typeof evaluateOutputData(expectedData.key, outputData), evaluateValue(expectedData.value, objExportData), expectedData.message);
    } else if (expectedData.assert === 'ok') {
      assert.ok(true);
    } else if (expectedData.assert === 'error') {
      assert.strictEqual(outputData, new Error(), expectedData.message);
    } else {
      throw new TestError(`expectedData.assert ${JSON.stringify(expectedData.assert)} is not recognized`);
    }
  });
}

function generateAssertForError (testcase, err) {
  let lstExpectedData = Array.isArray(testcase.expectedData) ? testcase.expectedData : [testcase.expectedData];
  lstExpectedData.forEach((expectedData) => {
    if (expectedData.assert === 'equal') {
      assert.fail(expectedData.message || err.message);
    } else if (expectedData.assert === 'notEqual') {
      assert.fail(expectedData.message || err.message);
    } else if (expectedData.assert === 'undefined') {
      assert.fail(expectedData.message || err.message);
    } else if (expectedData.assert === 'notUndefined') {
      assert.fail(expectedData.message || err.message);
    } else if (expectedData.assert === 'greater') {
      assert.fail(expectedData.message || err.message);
    } else if (expectedData.assert === 'less') {
      assert.fail(expectedData.message || err.message);
    } else if (expectedData.assert === 'typeof') {
      assert.fail(expectedData.message || err.message);
    } else if (expectedData.assert === 'ok') {
      assert.fail(expectedData.message || err.message);
    } else if (expectedData.assert === 'error') {
      if (expectedData.value != null) {
        assert.strictEqual(evaluateOutputData(expectedData.key || 'message', err), evaluateValue(expectedData.value, objExportData), expectedData.message);
      }
    } else {
      throw new TestError(`expectedData.assert ${JSON.stringify(expectedData.assert)} is not recognized`);
    }
  });
}

function evaluateOutputData (key, outputData) {
  if (key == null) return outputData;

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
  } else if (typeof obj === 'string' && obj.indexOf('$') !== -1) {
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
