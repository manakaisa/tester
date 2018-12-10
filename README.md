# tester
A codeless unit test

## Assertion Support
- equal (use Assert.deepStrictEqual)
- notEqual (use Assert.notDeepStrictEqual)
- undefined
- notUndefined
- greater
- less
- typeof
- ok
- error

## API
- get(key) => value
- set(key, value)
- use(<Array<command\>>)
  ```
  command:
  {
    name: "command name",
    command: <Function(inputData) => Promise>
  }
  ```
- beforeTest(<Function => Promise>)
- afterTest(<Function => Promise>)
- test(<Array<testcase\>>)
  ```
  testcase:
  {
    description: "test description",
    tests: [
      {
        test: "test name",
        command: "value of command name",
        inputData: <any|$exportData>,
        expectedData: [{
          assert: "value of supported assertion",
          key: "(optional) specific <output>.key to perform test",
          value: <any|$exportData>,
          message: "(optional) message shown when testing fail"
        }],
        exportData: "(optional) variable for exporting <output>, valid name: /^[A-Za-z_]\w*$/",
        skip: false
      }
    ]
  }
  ```
## Limitation
- Not support throwing non-error


## Plug-ins
### tester-plugin-webserver
A web server plug-in
#### API
- constructor([options])
  ```
  options:
  {
    port: 0,
    cors: false
  }
  ```
- start() => <Promise\>
- stop() => <Promise\>
- url => <string\>
- use(<Function(req, res, next)>)
- static([path,] folder)
- staticFile([path,] file)
- get(path, <Function(req, res)>)
- post(path, <Function(req, res)>)
- put(path, <Function(req, res)>)
- patch(path, <Function(req, res)>)
- delete(path, <Function(req, res)>)
#### Limitation
- Not support HTTPS
- Methods "use|static|staticFile|get|post|put|patch|delete" must be called in order and before "start" method

### tester-plugin-browser
A browser plug-in
#### API
- constructor([options])
  ```
  options:
  {
    webSecurity: true,
    debug: false
  }
  ```
- connect([url]) => <Promise\>
- close() => <Promise\>
- importJSModule(path, name) => <Promise\>
- evaluate(<Function(...args)>, ...args) => <Promise<object\>>
