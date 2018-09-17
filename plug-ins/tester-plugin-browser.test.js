const tester = require('../tester.js');
const Webserver = require('./tester-plugin-webserver.js');
const Browser = require('./tester-plugin-browser.js');

var webserver = new Webserver();
var browser = new Browser();

tester.beforeTest(async () => {
  webserver.get('/my-module.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`
      export function hello (value) {
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
    name: 'importJSModule',
    command: async () => {
      return browser.importJSModule('./my-module.js', 'myModule');
    }
  },
  {
    name: 'evaluate',
    command: async () => {
      let result = await browser.evaluate((arg) => window.myModule.hello(arg), 'world');

      if (result !== 'hello world') throw new Error();
    }
  },
  {
    name: 'verifyWebSecurity',
    command: async () => {
      let browser2 = new Browser({ webSecurity: false });
      await browser2.connect();
      await browser2.importJSModule(webserver.url + '/my-module.js', 'myModule');
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
      test: 'importJSModule',
      command: 'importJSModule',
      expectedData: { assert: 'ok' }
    },
    {
      test: 'evaluate',
      command: 'evaluate',
      expectedData: { assert: 'ok' }
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
