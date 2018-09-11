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

  static (folderPath) {
    this._app.use(express.static(path.join(__dirname, folderPath)));
  }

  staticFile (filePath) {
    this._app.use('/' + path.basename(filePath), (req, res, next) => {
      res.sendFile(path.join(__dirname, filePath));
    });
  }

  get (path, fn) {
    this._app.get(path, fn);
  }

  post (path, fn) {
    this._app.post(path, fn);
  }

  put (path, fn) {
    this._app.put(path, fn);
  }

  patch (path, fn) {
    this._app.patch(path, fn);
  }

  delete (path, fn) {
    this._app.delete(path, fn);
  }
}

module.exports = WebServer;
