[![NPM version](https://badge.fury.io/js/procoder-watcher.png)](https://badge.fury.io/js/procoder-watcher)
[![Build Status](https://travis-ci.org/kuu/procoder-watcher.svg?branch=master)](https://travis-ci.org/kuu/procoder-watcher)
[![Coverage Status](https://coveralls.io/repos/github/kuu/procoder-watcher/badge.svg?branch=master)](https://coveralls.io/github/kuu/procoder-watcher?branch=master)
[![Dependency Status](https://gemnasium.com/kuu/procoder-watcher.png)](https://gemnasium.com/kuu/procoder-watcher)

# procoder-watcher
Exposes REST APIs to retrieve ProCoder's status

## APIs
| Method | Path                   | Description   | Request Params | Query Strings | Response JSON Format  |
| ------ | ---------------------- | ------------- | ------------- | ------------- | ------------- |
| GET    | /api/logs/:num          | Returns the last {`num`} log entries in reverse chronological order | `num` must be an integer between 1 to 128 | - | [{state: `"queued"/"started"/"completed"/"failed"`, date: `datetime of the log entry`}] |

### Response JSON Format
The response is an array of objects. Each object has the following format:

| Field | Type                   | Description   |
| ------ | ---------------------- | ------------- |
| type    | string          | "TRANSCODINGJOB" |
| status    | string          | Either of "queued"/"started"/"completed"/"failed" |
| source    | string          | The name of the source file |
| queuedTime    | string          | The time when the transcoding gets started |
| error    | object          | If any error occurred, an error object, otherwise null |
| progress    | number          | Percentage to represent the encoding progress |
| destination    | string          | The name of the output file |
| endTime    | string          | The time when the transcoding completed |
| fileSize    | number          | The file size of the output file |

## Install
* Install [Node.js](https://nodejs.org/)
* Clone source code and install dependencies

```
$ git clone git@github.com:kuu/procoder-watcher.git
$ cd procoder-watcher
$ npm install
```

## Run
* Start the server with specifying parameters (see below)

```
$ PORT={port number} LOG_PATH={full path} npm start
```

* Once the server gets started, you can access the APIs

```
$ curl http://localhost:3000/api/logs/3
[
  {
    "type": "TRANSCODINGJOB",
    "status": "completed",
    "source": "xxx.avi",
    "queuedTime": "2018-04-17T12:14:22.000Z",
    "error": null,
    "progress": 100,
    "destination": "xxx.mp4",
    "endTime": "2018-04-17T12:16:36.395Z",
    "fileSize": 596487805
  }
  ...
]

```
* Timezone is UTC
* Use DEBUG environ variable for detail logs
```
$ DEBUG=procoder-watcher npm start
```

## Stop
* You can stop the server by the following command in the same directory you did `npm start`

```
$ npm stop
```

### Parameters
The parameters can be specified via environment variables:

| Variable | Description   | Default Value|
| ------ | ------------- | ------------- |
| PORT   | Port number to listen for HTTP requests | 3000 |
| LOG_PATH    | Directory where the ProCoder log files are located | current directory |
| INTERVAL    | How frequently the log files are read (in milliseconds)  | 1000 |
| DEBUG    | To enable the debug trace, add `procoder-watcher` to the DEBUG variable | - (no debug trace) |