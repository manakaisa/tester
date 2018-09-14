const http = require('http');
const path = require('path');
const express = require('express');

class WebServer {
  constructor (options = {}) {
    this._protocol = 'http';
    this._host = 'localhost';
    this._port = options.port || 0;
    this._app = express();
    this._server = http.createServer(this._app);

    if (options.cors === true) {
      this._app.use((req, res, next) => {
        res.header('access-control-allow-origin', '*');
        res.header('access-control-allow-headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
      });
    }
  }

  get url () {
    let addressInfo = this._server.address();
    return `${this._protocol}://${addressInfo.address}:${addressInfo.port}`;
  }

  async start () {
    this._app.get('/', (req, res) => {
      res.send(`<html><head></head><body></body></html>`);
    });

    return new Promise((resolve, reject) => {
      this._server
        .on('listening', () => {
          resolve();
        })
        .on('error', (err) => {
          reject(err);
        })
        .listen(this._port, this._host);
    });
  }

  async stop () {
    return new Promise((resolve, reject) => {
      this._server
        .on('close', () => {
          resolve();
        })
        .on('error', (err) => {
          reject(err);
        })
        .close();
    });
  }

  use (fn) {
    this._app.use(fn);
  }

  static (urlPath, folder) {
    if (folder === undefined) {
      folder = urlPath;
      urlPath = '/';
    }
    if (urlPath === null) urlPath = '/';

    this._app.use(urlPath, express.static(path.join(__dirname, folder)));
  }

  staticFile (urlPath, file) {
    if (file === undefined) {
      file = urlPath;
      urlPath = '';
    }
    if (urlPath === null) urlPath = '';
    if (urlPath === '/') urlPath = '';

    this._app.use(`${urlPath}/${path.basename(file)}`, (req, res, next) => {
      res.sendFile(path.join(__dirname, file));
    });
  }

  get (urlPath, fn) {
    this._app.get(urlPath, fn);
  }

  post (urlPath, fn) {
    this._app.post(urlPath, fn);
  }

  put (urlPath, fn) {
    this._app.put(urlPath, fn);
  }

  patch (urlPath, fn) {
    this._app.patch(urlPath, fn);
  }

  delete (urlPath, fn) {
    this._app.delete(urlPath, fn);
  }
}

module.exports = WebServer;
