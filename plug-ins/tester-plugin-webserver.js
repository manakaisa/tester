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

    this._app.use(express.json());
    this._app.use(express.urlencoded({ extended: false }));

    if (options.cors === true) {
      this._app.use((req, res, next) => {
        res.header('access-control-allow-origin', '*');
        res.header('access-control-allow-headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
      });
    }
  }

  get url () {
    let address = this._server.address();
    return `${this._protocol}://${this._host}:${address.port}`;
  }

  async start () {
    this._app.get('/', (req, res) => {
      res.send(`<html><head></head><body></body></html>`);
    });

    this._app.use((req, res) => {
      res.status(404).send();
    });

    this._app.use((err, req, res, next) => {
      res.status(500).send(err.message);
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

  static (pathURL, folder) {
    if (folder == null) {
      folder = pathURL;
      pathURL = '/';
    }
    if (pathURL == null) pathURL = '/';

    this._app.use(pathURL, express.static(path.join(__dirname, folder)));
  }

  staticFile (pathURL, file) {
    if (file == null) {
      file = pathURL;
      pathURL = '';
    }
    if (pathURL == null) pathURL = '';
    if (pathURL === '/') pathURL = '';

    this._app.use(`${pathURL}/${path.basename(file)}`, (req, res, next) => {
      res.sendFile(path.join(__dirname, file));
    });
  }

  get (pathURL, fn) {
    this._app.get(pathURL, fn);
  }

  post (pathURL, fn) {
    this._app.post(pathURL, fn);
  }

  put (pathURL, fn) {
    this._app.put(pathURL, fn);
  }

  patch (pathURL, fn) {
    this._app.patch(pathURL, fn);
  }

  delete (pathURL, fn) {
    this._app.delete(pathURL, fn);
  }
}

module.exports = WebServer;
