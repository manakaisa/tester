const tester = require('../tester.js');
const Webserver = require('./tester-plugin-webserver.js');
const Browser = require('./tester-plugin-browser.js');

var webserver = new Webserver();
var browser = new Browser({ debug: true });

tester.beforeTest(async () => {
  webserver.get('/my-module.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`
      export function hello (value) {
        return 'hello ' + value;
      }
      export default function (value) {
        return 'hello ' + value;
      }
    `);
  });
  await webserver.start();
});

tester.afterTest(async () => {
  await webserver.stop();
});

tester.use([
  {
    name: 'connect',
    command: async () => {
      return browser.connect(webserver.url);
    }
  },
  {
    name: 'close',
    command: async () => {
      return browser.close();
    }
  },
  {
    name: 'importJSModuleAsNameSpace',
    command: async () => {
      return browser.importJSModuleAsNameSpace('./my-module.js', 'myModuleNameSpace');
    }
  },
  {
    name: 'importJSModuleAsDefault',
    command: async () => {
      return browser.importJSModuleAsDefault('./my-module.js', 'myModuleDefault');
    }
  },
  {
    name: 'evaluate',
    command: async () => {
      let result = await browser.evaluate(arg => window.myModuleNameSpace.hello(arg), 'world');

      if (result !== 'hello world') throw new Error();
    }
  },
  {
    name: 'evaluateAsync',
    command: async () => {
      let result = await browser.evaluate(async arg => window.myModuleDefault(arg), 'world');

      if (result !== 'hello world') throw new Error();
    }
  },
  {
    name: 'evaluateError',
    command: async (inputData) => {
      return browser.evaluate(msg => {
        throw new Error(msg);
      }, inputData.message);
    }
  },
  {
    name: 'evaluateErrorAsync',
    command: async (inputData) => {
      return browser.evaluate(async msg => {
        throw new Error(msg);
      }, inputData.message);
    }
  },
  {
    name: 'verifyWebSecurity',
    command: async () => {
      let browser2 = new Browser({ webSecurity: false });
      await browser2.connect();
      await browser2.importJSModuleAsNameSpace(webserver.url + '/my-module.js', 'myModule');
      await browser2.close();
    }
  }
]);

tester.test({
  description: 'browser',
  testcases: [
    {
      test: 'connect',
      command: 'connect',
      expectedData: { assert: 'ok' }
    },
    {
      test: 'importJSModuleAsNameSpace',
      command: 'importJSModuleAsNameSpace',
      expectedData: { assert: 'ok' }
    },
    {
      test: 'importJSModuleAsDefault',
      command: 'importJSModuleAsDefault',
      expectedData: { assert: 'ok' }
    },
    {
      test: 'evaluate',
      command: 'evaluate',
      expectedData: { assert: 'ok' }
    },
    {
      test: 'evaluate (async)',
      command: 'evaluateAsync',
      expectedData: { assert: 'ok' }
    },
    {
      test: 'evaluate (error)',
      command: 'evaluateError',
      inputData: {
        message: 'some error'
      },
      expectedData: { assert: 'error', value: 'some error' }
    },
    {
      test: 'evaluate (async, error)',
      command: 'evaluateErrorAsync',
      inputData: {
        message: 'some error'
      },
      expectedData: { assert: 'error', value: 'some error' }
    },
    {
      test: 'verifyWebSecurity',
      command: 'verifyWebSecurity',
      expectedData: { assert: 'ok' }
    },
    {
      test: 'close',
      command: 'close',
      expectedData: { assert: 'ok' }
    }
  ]
});
