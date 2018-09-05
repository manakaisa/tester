# tester
A codeless unit test

## Assertion Support
- equal (use Assert.deepStrictEqual)
- notEqual (use Assert.notDeepStrictEqual)
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
