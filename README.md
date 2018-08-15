# tester
A codeless unit test

## Assert Support
- equal (use Assert.deepStrictEqual)
- notEqual (use Assert.notDeepStrictEqual)
- greater
- less
- typeof
- ok
- error

## API
- get(key)
- set(key, value)
- use([command])
  ```
  command:
  {
    name: "<name>",
    command: Function (inputData, done)
  }
  ```
- beforeTest(Function)
- afterTest(Function)
- test([testcase])
  ```
  testcase:
  {
    description: "<description>",
    tests: [
      {
        test: "<name>",
        command: "<command name>",
        inputData: {}, // or any standard objects, or $exportData
        expectedData: [{
          assert: "<value of Assert>",
          key: "", // (optional), refer to <output>.key
          value: {}, // or any standard objects, or $exportData
          message: "" // (optional)
        }],
        exportData: "", // (optional), valid name: /^[A-Za-z_]\w*$/
        skip: false
      }
    ]
  }
  ```
