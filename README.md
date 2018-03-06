# salak-router

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![David deps][david-image]][david-url]
[![NPM download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/salak-router.svg?style=flat-square
[npm-url]: https://npmjs.org/package/salak-router
[travis-image]: https://img.shields.io/travis/SalakJS/salak-router.svg?style=flat-square
[travis-url]: https://travis-ci.org/SalakJS/salak-router
[david-image]: https://img.shields.io/david/SalakJS/salak-router.svg?style=flat-square
[david-url]: https://david-dm.org/SalakJS/salak-router
[download-image]: https://img.shields.io/npm/dm/salak-router.svg?style=flat-square
[download-url]: https://npmjs.org/package/salak-router

> base on koa-router & joi

* Support request validate.
* Support response validate.

## Installation

Install using [npm](https://www.npmjs.org/):

```sh
npm install --save salak-router
```

## API Reference

* salak-router
  * Router (extends koa-router)  
        * new Router([opts])  
        * _instance_  
            * .addRoute(opts, handler)


### Router

#### new Router([opts])


| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>Object</code> |  |
| [opts.prefix] | <code>String</code> | prefix router paths |
| [opts.requestFailure] | <code>Number</code> | request validation error status |
| [opts.responseFailure] | <code>String</code> | response validation error status|


#### .addRoute(opts, handler)

add route for app

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | |
| opts.path | <code>String</code> | router path |
| opts.method | <code>Array|String</code> | router method |
| opts.validate | <code>Object</code> | router validation schema |
| handler | <code>Function</code> | router handler |

## Example

```
const Koa = require('koa')
const Router = require('salak-router')
const Joi = Router.Joi

const app = new Koa()
const router = new Router()

router.addRoute({
  path: '/test',
  method: 'GET',
  validate: {
    query: {
      id: Joi.number().required().description('文章id')
    },
    responses: {
      200: {
        body: Joi.object().keys({
          code: Joi.number(),
          msg: Joi.string()
        }).description('文章详情')
      }
    }
  }
}, async (ctx) => {
  ctx.body = {
    code: 0,
    msg: 'ok'
  }
})

app.use(router.routes())

app.listen(3000)
```

## LICENSE

MIT
