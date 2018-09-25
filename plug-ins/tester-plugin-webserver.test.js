const http = require('http');
const { URL } = require('url');
const tester = require('../tester.js');
const WebServer = require('./tester-plugin-webserver.js');

var webserver = new WebServer({ port: 3000, cors: true });
var verifiedUse = false;
var verifiedGet = false;
var verifiedPost = false;
var verifiedPut = false;
var verifiedPatch = false;
var verifiedDelete = false;
var defaultIndex = true;

tester.use([
  {
    name: 'use',
    command: async () => {
      webserver.use((req, res, next) => {
        verifiedUse = true;
        next();
      });
    }
  },
  {
    name: 'staticFolder',
    command: async (inputData) => {
      webserver.static(inputData.path, inputData.folder);
    }
  },
  {
    name: 'staticFolderDefaultRoot',
    command: async (inputData) => {
      webserver.static(inputData.folder);
    }
  },
  {
    name: 'staticFile',
    command: async (inputData) => {
      webserver.staticFile(inputData.path, inputData.file);
    }
  },
  {
    name: 'staticFileDefaultRoot',
    command: async (inputData) => {
      webserver.staticFile(inputData.file);
    }
  },
  {
    name: 'get',
    command: async (inputData) => {
      webserver.get(inputData.path, (req, res) => {
        verifiedGet = true;
        res.send();
      });
    }
  },
  {
    name: 'post',
    command: async (inputData) => {
      webserver.post(inputData.path, (req, res) => {
        verifiedPost = true;
        res.send();
      });
    }
  },
  {
    name: 'put',
    command: async (inputData) => {
      webserver.put(inputData.path, (req, res) => {
        verifiedPut = true;
        res.send();
      });
    }
  },
  {
    name: 'patch',
    command: async (inputData) => {
      webserver.patch(inputData.path, (req, res) => {
        verifiedPatch = true;
        res.send();
      });
    }
  },
  {
    name: 'delete',
    command: async (inputData) => {
      webserver.delete(inputData.path, (req, res) => {
        verifiedDelete = true;
        res.send();
      });
    }
  },
  {
    name: 'index',
    command: async () => {
      webserver.get('/', (req, res, next) => {
        if (defaultIndex) return next();

        res.send('<index>');
      });
    }
  },
  {
    name: 'start',
    command: async () => {
      return webserver.start();
    }
  },
  {
    name: 'stop',
    command: async () => {
      return webserver.stop();
    }
  },
  {
    name: 'url',
    command: async () => {
      return webserver.url;
    }
  },
  {
    name: 'handledError',
    command: async (inputData) => {
      webserver.get(inputData.path, (req, res) => {
        res.status(inputData.status).send(inputData.message);
      });
    }
  },
  {
    name: 'unHandledError',
    command: async (inputData) => {
      webserver.get(inputData.path, (req, res) => {
        throw new Error();
      });
    }
  },
  {
    name: 'verifyUse',
    command: async () => {
      await new Promise((resolve, reject) => {
        http.get(webserver.url)
          .on('response', (res) => {
            if (!verifiedUse) return reject(new Error());

            resolve();
          })
          .on('error', (err) => {
            reject(err);
          });
      });
    }
  },
  {
    name: 'verifyResponse',
    command: async (inputData) => {
      return new Promise((resolve, reject) => {
        http.get(webserver.url + inputData.path)
          .on('response', (res) => {
            if (res.statusCode !== 200) return reject(new Error(res.statusCode));

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
    name: 'verifyGet',
    command: async (inputData) => {
      await new Promise((resolve, reject) => {
        http.get(webserver.url + inputData.path)
          .on('response', (res) => {
            if (!verifiedGet) return reject(new Error());

            resolve();
          })
          .on('error', (err) => {
            reject(err);
          });
      });
    }
  },
  {
    name: 'verifyPost',
    command: async (inputData) => {
      await new Promise((resolve, reject) => {
        let url = new URL(webserver.url);
        http.request({
          hostname: url.hostname,
          port: url.port,
          path: inputData.path,
          method: 'POST'
        })
          .on('response', (res) => {
            if (!verifiedPost) return reject(new Error());

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
    name: 'verifyPut',
    command: async (inputData) => {
      await new Promise((resolve, reject) => {
        let url = new URL(webserver.url);
        http.request({
          hostname: url.hostname,
          port: url.port,
          path: inputData.path,
          method: 'PUT'
        })
          .on('response', (res) => {
            if (!verifiedPut) return reject(new Error());

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
    name: 'verifyPatch',
    command: async (inputData) => {
      await new Promise((resolve, reject) => {
        let url = new URL(webserver.url);
        http.request({
          hostname: url.hostname,
          port: url.port,
          path: inputData.path,
          method: 'PATCH'
        })
          .on('response', (res) => {
            if (!verifiedPatch) return reject(new Error());

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
    name: 'verifyDelete',
    command: async (inputData) => {
      await new Promise((resolve, reject) => {
        let url = new URL(webserver.url);
        http.request({
          hostname: url.hostname,
          port: url.port,
          path: inputData.path,
          method: 'DELETE'
        })
          .on('response', (res) => {
            if (!verifiedDelete) return reject(new Error());

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
    name: 'verifyIndex',
    command: async () => {
      defaultIndex = false;

      return new Promise((resolve, reject) => {
        let url = new URL(webserver.url);
        http.request({
          hostname: url.hostname,
          port: url.port,
          path: '/',
          method: 'GET'
        })
          .on('response', (res) => {
            if (res.statusCode !== 200) return reject(new Error(res.statusCode));

            res.setEncoding('utf8');
            res.on('readable', () => {
              resolve(res.read());
            });
          })
          .on('error', (err) => {
            reject(err);
          })
          .end();
      });
    }
  },
  {
    name: 'verifyIndexDefault',
    command: async () => {
      defaultIndex = true;

      return new Promise((resolve, reject) => {
        let url = new URL(webserver.url);
        http.request({
          hostname: url.hostname,
          port: url.port,
          path: '/',
          method: 'GET'
        })
          .on('response', (res) => {
            if (res.statusCode !== 200) return reject(new Error(res.statusCode));

            res.setEncoding('utf8');
            res.on('readable', () => {
              resolve(res.read());
            });
          })
          .on('error', (err) => {
            reject(err);
          })
          .end();
      });
    }
  },
  {
    name: 'verifyHeader',
    command: async () => {
      return new Promise((resolve, reject) => {
        http.get(webserver.url)
          .on('response', (res) => {
            if (res.statusCode !== 200) return reject(new Error(res.statusCode));

            resolve(res.headers);
          })
          .on('error', (err) => {
            reject(err);
          });
      });
    }
  },
  {
    name: 'verifyError',
    command: async (inputData) => {
      return new Promise((resolve, reject) => {
        let url = new URL(webserver.url);
        http.request({
          hostname: url.hostname,
          port: url.port,
          path: inputData.path,
          method: 'GET'
        })
          .on('response', (res) => {
            res.setEncoding('utf8');
            res.on('readable', () => {
              resolve({
                status: res.statusCode,
                message: res.read()
              });
            });
          })
          .on('error', (err) => {
            reject(err);
          })
          .end();
      });
    }
  }
]);

tester.test([
  {
    description: 'prepare',
    testcases: [
      {
        test: 'use',
        command: 'use',
        expectedData: { assert: 'ok' }
      },
      {
        test: 'static folder',
        command: 'staticFolder',
        inputData: {
          path: '/public',
          folder: './'
        },
        expectedData: { assert: 'ok' }
      },
      {
        test: 'static folder (default root)',
        command: 'staticFolderDefaultRoot',
        inputData: {
          folder: './'
        },
        expectedData: { assert: 'ok' }
      },
      {
        test: 'static file',
        command: 'staticFile',
        inputData: {
          path: '/public',
          file: '../package.json'
        },
        expectedData: { assert: 'ok' }
      },
      {
        test: 'static file (default root)',
        command: 'staticFileDefaultRoot',
        inputData: {
          file: '../package.json'
        },
        expectedData: { assert: 'ok' }
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
        test: 'index',
        command: 'index',
        expectedData: { assert: 'ok' }
      },
      {
        test: 'error (handled)',
        command: 'handledError',
        inputData: {
          path: '/error',
          status: 501,
          message: 'handled error'
        },
        expectedData: { assert: 'ok' }
      },
      {
        test: 'error (unhandled)',
        command: 'unHandledError',
        inputData: {
          path: '/error2'
        },
        expectedData: { assert: 'ok' }
      }
    ]
  }
]);
tester.test([
  {
    description: 'webserver',
    testcases: [
      {
        test: 'start',
        command: 'start',
        expectedData: { assert: 'ok' }
      },
      {
        test: 'url',
        command: 'url',
        expectedData: { assert: 'equal', value: 'http://localhost:3000' }
      },
      {
        test: 'verify use',
        command: 'verifyUse',
        expectedData: { assert: 'ok' }
      },
      {
        test: 'verify static folder',
        command: 'verifyResponse',
        inputData: {
          path: '/public/tester-plugin-webserver.js'
        },
        expectedData: { assert: 'greater', key: 'length', value: 0 }
      },
      {
        test: 'verify static folder (default root)',
        command: 'verifyResponse',
        inputData: {
          path: '/tester-plugin-webserver.js'
        },
        expectedData: { assert: 'greater', key: 'length', value: 0 }
      },
      {
        test: 'verify static file',
        command: 'verifyResponse',
        inputData: {
          path: '/package.json'
        },
        expectedData: { assert: 'greater', key: 'length', value: 0 }
      },
      {
        test: 'verify static file (default root)',
        command: 'verifyResponse',
        inputData: {
          path: '/public/package.json'
        },
        expectedData: { assert: 'greater', key: 'length', value: 0 }
      },
      {
        test: 'verify get',
        command: 'verifyGet',
        inputData: {
          path: '/get'
        },
        expectedData: { assert: 'ok' }
      },
      {
        test: 'verify post',
        command: 'verifyPost',
        inputData: {
          path: '/post'
        },
        expectedData: { assert: 'ok' }
      },
      {
        test: 'verify put',
        command: 'verifyPut',
        inputData: {
          path: '/put'
        },
        expectedData: { assert: 'ok' }
      },
      {
        test: 'verify patch',
        command: 'verifyPatch',
        inputData: {
          path: '/patch'
        },
        expectedData: { assert: 'ok' }
      },
      {
        test: 'verify delete',
        command: 'verifyDelete',
        inputData: {
          path: '/delete'
        },
        expectedData: { assert: 'ok' }
      },
      {
        test: 'verify (default) index',
        command: 'verifyIndexDefault',
        expectedData: { assert: 'equal', value: '<html><head></head><body></body></html>' }
      },
      {
        test: 'verify index',
        command: 'verifyIndex',
        expectedData: { assert: 'equal', value: '<index>' }
      },
      {
        test: 'verify cors',
        command: 'verifyHeader',
        expectedData: { assert: 'equal', key: 'access-control-allow-origin', value: '*' }
      },
      {
        test: 'verify error 404',
        command: 'verifyError',
        inputData: {
          path: '/some_path'
        },
        expectedData: { assert: 'equal', key: 'status', value: 404 }
      },
      {
        test: 'verify error 501 (handled)',
        command: 'verifyError',
        inputData: {
          path: '/error'
        },
        expectedData: { assert: 'equal', value: { status: 501, message: 'handled error' } }
      },
      {
        test: 'verify error 500 (unhandled)',
        command: 'verifyError',
        inputData: {
          path: '/error2'
        },
        expectedData: { assert: 'equal', key: 'status', value: 500 }
      },
      {
        test: 'stop',
        command: 'stop',
        expectedData: { assert: 'ok' }
      }
    ]
  }
]);
