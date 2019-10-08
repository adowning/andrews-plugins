[![Build Status](https://travis-ci.org/kuzzleio/kuzzle-plugin-logger.svg?branch=master)](https://travis-ci.org/kuzzleio/kuzzle-plugin-logger)

# Kuzzle logger plugin

This plugin is a bridge between Kuzzle and [winston](https://www.npmjs.com/package/winston) package.
It is part of the default plugins provided with Kuzzle.

Currently, three winston transports are supported:

* `stdout` (winston `Console`)
* `file` (winston `File`)
* `syslog` (from [winston-syslog](https://www.npmjs.com/package/winston-syslog))


## Configuration

Each transport can be added and configured by adding it to the `services` entry.

The content of this section is _almost_ passed as-is to `winston` related transport constructor.

The only exception is `addDate` and `dateFormat` parameters, which are specific to Kuzzle and allow to specify a custom 
date format using only plain-text configuration, using [moment format](http://momentjs.com/docs/#/displaying/format/).

:warning: **Contrary to winston, it is not possible to pass a function to any option.**

Sample:

```json
{
  "threads": 2,
  "services": {
    "file": {
      "level": "warn",
      "filename": "kuzzle.log",
      "addDate": true,
      "dateFormat": "dddd, MMMM Do YYYY, h:mm:ss a"
    },
    "stdout": {
      "level": "info",
      "addDate": "true"
    },
    "syslog": {
      "protocol": "unix",
      "path": "/dev/log",
      "facility": "local6"
    }
  }
}
```

## Default configuration

If no configuration is given, this plugin will output logs to the console only, from `info` level and above.

## Transports configuration references

* [stdout](https://github.com/winstonjs/winston/blob/master/docs/transports.md#console-transport)
* [file](https://github.com/winstonjs/winston/blob/master/docs/transports.md#file-transport)
* [syslog](https://github.com/winstonjs/winston-syslog)

## Date formatting

Native `winston` date related/timestamp configurations are merged during the plugin init for transports that support it.

In other words, `timestamp` and `addDate` can be used indifferently for `stdout` and `file` transports: 

```json
{
  "services": {
    "stdout": {
      "timestamp": true,
      "dateFormat": "YYYY-MM-DD HH-mm-ss"
    }
  }
}
```

# How to create a plugin

Please refer to [Kuzzle plugin documentation](http://kuzzle.io/guide/#plugins) for more information on how to build you own plugins.

# About Kuzzle

Kuzzle is an open-source back-end solution for various applications.

It combines a high level API, a database, a real-time engine, subscription and notification mechanisms as well as some advanced search features. The API is accessible through several standard protocols.

http://kuzzle.io
