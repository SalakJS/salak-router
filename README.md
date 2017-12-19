# salak-router

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
const Joi = require('joi')

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
