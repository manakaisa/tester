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
          key: "(optional), specify <output>.key to perform test",
          value: <any|$exportData>,
          message: "(optional), show message when testing fail"
        }],
        exportData: "(optional), define variable for exporting <output>, valid name: /^[A-Za-z_]\w*$/",
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
    port: 0
  }
  ```
- start() => Promise
- stop() => Promise
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
