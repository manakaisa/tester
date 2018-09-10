const http = require('http');
const { URL } = require('url');
const tester = require('../tester.js');
const WebServer = require('./tester-plugin-webserver.js');

var webserver = new WebServer({ port: 3000 });

tester.use([
  {
    name: 'start',
    command: async (inputData) => {
      await webserver.start();
    }
  },
  {
    name: 'stop',
    command: async (inputData) => {
      await webserver.stop();
    }
  },
  {
    name: 'url',
    command: async () => {
      return webserver.url;
    }
  },
  {
    name: 'use',
    command: async () => {
      let isCalled = false;

      webserver.use((req, res, next) => {
        isCalled = true;
        next();
      });

      await new Promise((resolve, reject) => {
        http.get(webserver.url)
          .on('response', (res) => {
            if (!isCalled) return reject(new Error());

            resolve();
          })
          .on('error', (err) => {
            reject(err);
          });
      });
    }
  },
  {
    name: 'static',
    command: async (inputData) => {
      webserver.static(inputData.path);
    }
  },
  {
    name: 'staticFile',
    command: async (inputData) => {
      webserver.staticFile(inputData.path);
    }
  },
  {
    name: 'verifyStatic',
    command: async (inputData) => {
      return new Promise((resolve, reject) => {
        http.get(webserver.url + inputData.path)
          .on('response', (res) => {
            if (res.statusCode !== 200) return reject(new Error());

            res.setEncoding('utf8');
            res.on('readable', () => {
              resolve(res.read());
            });
          })
          .on('error', (err) => {
            reject(err);
          });
      });
    }
  },
  {
    name: 'get',
    command: async (inputData) => {
      let isCalled = false;

      webserver.get(inputData.path, (req, res) => {
        isCalled = true;
        res.send();
      });

      return new Promise((resolve, reject) => {
        http.get(webserver.url + inputData.path)
          .on('response', (res) => {
            if (!isCalled) return reject(new Error());

            resolve();
          })
          .on('error', (err) => {
            reject(err);
          });
      });
    }
  },
  {
    name: 'post',
    command: async (inputData) => {
      let isCalled = false;

      webserver.post(inputData.path, (req, res) => {
        isCalled = true;
        res.send();
      });

      return new Promise((resolve, reject) => {
        let url = new URL(webserver.url);
        http.request({
          hostname: url.hostname,
          port: url.port,
          path: inputData.path,
          method: 'POST',
          timeout: 1000
        })
          .on('response', (res) => {
            if (!isCalled) return reject(new Error());

            resolve();
          })
          .on('error', (err) => {
            reject(err);
          })
          .end();
      });
    }
  },
  {
    name: 'put',
    command: async (inputData) => {
      let isCalled = false;

      webserver.put(inputData.path, (req, res) => {
        isCalled = true;
        res.send();
      });

      return new Promise((resolve, reject) => {
        let url = new URL(webserver.url);
        http.request({
          hostname: url.hostname,
          port: url.port,
          path: inputData.path,
          method: 'PUT',
          timeout: 1000
        })
          .on('response', (res) => {
            if (!isCalled) return reject(new Error());

            resolve();
          })
          .on('error', (err) => {
            reject(err);
          })
          .end();
      });
    }
  },
  {
    name: 'patch',
    command: async (inputData) => {
      let isCalled = false;

      webserver.patch(inputData.path, (req, res) => {
        isCalled = true;
        res.send();
      });

      return new Promise((resolve, reject) => {
        let url = new URL(webserver.url);
        http.request({
          hostname: url.hostname,
          port: url.port,
          path: inputData.path,
          method: 'PATCH',
          timeout: 1000
        })
          .on('response', (res) => {
            if (!isCalled) return reject(new Error());

            resolve();
          })
          .on('error', (err) => {
            reject(err);
          })
          .end();
      });
    }
  },
  {
    name: 'delete',
    command: async (inputData) => {
      let isCalled = false;

      webserver.delete(inputData.path, (req, res) => {
        isCalled = true;
        res.send();
      });

      return new Promise((resolve, reject) => {
        let url = new URL(webserver.url);
        http.request({
          hostname: url.hostname,
          port: url.port,
          path: inputData.path,
          method: 'DELETE',
          timeout: 1000
        })
          .on('response', (res) => {
            if (!isCalled) return reject(new Error());

            resolve();
          })
          .on('error', (err) => {
            reject(err);
          })
          .end();
      });
    }
  },
  {
    name: 'parm',
    command: async (inputData) => {
      let isCalled = false;

      webserver.get(inputData.parm, (req, res) => {
        isCalled = true;
        res.send();
      });

      return new Promise((resolve, reject) => {
        let url = new URL(webserver.url);
        http.request({
          hostname: url.hostname,
          port: url.port,
          path: inputData.path,
          method: 'GET',
          timeout: 1000
        })
          .on('response', (res) => {
            if (!isCalled) return reject(new Error());

            resolve();
          })
          .on('error', (err) => {
            reject(err);
          })
          .end();
      });
    }
  }
]);

tester.test({
  description: 'webserver-start',
  testcases: [
    {
      test: 'start',
      command: 'start',
      inputData: {
        port: 3000
      },
      expectedData: { assert: 'ok' }
    }
  ]
});

tester.test([
  {
    description: 'webserver-methods',
    testcases: [
      {
        test: 'url',
        command: 'url',
        expectedData: { assert: 'equal', value: 'http://127.0.0.1:3000' }
      },
      {
        test: 'use',
        command: 'use',
        expectedData: { assert: 'ok' }
      },
      {
        description: 'static',
        testcases: [
          {
            test: 'static folder',
            command: 'static',
            inputData: {
              path: './'
            },
            expectedData: { assert: 'ok' }
          },
          {
            test: 'verify static folder',
            command: 'verifyStatic',
            inputData: {
              path: '/tester-plugin-webserver.js'
            },
            expectedData: { assert: 'greater', key: '$outputData.length', value: 0 }
          },
          {
            test: 'static file',
            command: 'staticFile',
            inputData: {
              path: '../package.json'
            },
            expectedData: { assert: 'ok' }
          },
          {
            test: 'verify static folder',
            command: 'verifyStatic',
            inputData: {
              path: '/tester-plugin-webserver.js'
            },
            expectedData: { assert: 'greater', key: '$outputData.length', value: 0 }
          }
        ]
      },
      {
        test: 'get',
        command: 'get',
        inputData: {
          path: '/get'
        },
        expectedData: { assert: 'ok' }
      },
      {
        test: 'post',
        command: 'post',
        inputData: {
          path: '/post'
        },
        expectedData: { assert: 'ok' }
      },
      {
        test: 'put',
        command: 'put',
        inputData: {
          path: '/put'
        },
        expectedData: { assert: 'ok' }
      },
      {
        test: 'patch',
        command: 'patch',
        inputData: {
          path: '/patch'
        },
        expectedData: { assert: 'ok' }
      },
      {
        test: 'delete',
        command: 'delete',
        inputData: {
          path: '/delete'
        },
        expectedData: { assert: 'ok' }
      },
      {
        test: 'get (parm)',
        command: 'parm',
        inputData: {
          parm: '/parm1/:parm1/parm2/:parm2',
          path: '/parm1/1/parm2/2'
        },
        expectedData: { assert: 'ok' }
      }
    ]
  }
]);

tester.test({
  description: 'webserver-stop',
  testcases: [
    {
      test: 'stop',
      command: 'stop',
      expectedData: { assert: 'ok' }
    }
  ]
});
