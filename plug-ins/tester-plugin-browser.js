const puppeteer = require('puppeteer');

class Browser {
  constructor (options = {}) {
    this._webSecurity = (options.webSecurity == null) ? true : options.webSecurity;
    this._browser = null;
    this._page = null;
    this._debug = options.debug;
  }

  async connect (url = 'about:blank') {
    let browserOptions = ['--no-sandbox'];
    if (this._webSecurity === false) browserOptions.push('--disable-web-security');

    this._browser = await puppeteer.launch({ args: browserOptions });
    this._page = await this._browser.newPage();
    await this._page.goto(url);

    if (this._debug === true) {
      this._page.on('console', msg => {
        console.log(msg.text());
      });
    }
  }

  async close () {
    return this._browser.close();
  }

  async importJSModule (path, name) {
    await this._page.addScriptTag({
      type: 'module',
      url: path
    });
    await this._page.addScriptTag({
      type: 'module',
      content: `
        import * as ${name} from '${path}';
        window.${name} = ${name};
      `
    });
  }

  // async evaluate (fn, ...args) {
  //   return this._page
  //     .evaluate(fn, ...args)
  //     .catch((err) => {
  //       let lstErrMsg = err.message.split('\n');
  //       lstErrMsg = lstErrMsg[0].split(': ');
  //       err.message = lstErrMsg[lstErrMsg.length - 1];
  //       throw err;
  //     });
  // }

  async evaluate (fn, ...args) {
    let script = `
      let fn = ${fn.toString()};
      try {
        let result = fn(...args);

        if(result && result.then) {
          return new Promise((resolve, reject) => {
            result.then((resultPromise) => {
              resolve({
                result: resultPromise,
                isError: false,
                errorMessage: null
              });
            }).catch((err) => {
              resolve({
                result: null,
                isError: true,
                errorMessage: err.message
              });
            });
          });
        } else {
          return {
            result: result,
            isError: false,
            errorMessage: null
          };
        }
      } catch (err) {
        return {
          result: null,
          isError: true,
          errorMessage: err.message
        };
      }
    `;
    let result = await this._page.evaluate(new Function('...args', script), ...args);

    if (result.isError) throw new Error(result.errorMessage);

    return result.result;
  }

  async setOfflineMode (enabled) {
    return this._page.setOfflineMode(enabled);
  }
}

module.exports = Browser;
