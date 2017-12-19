const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const Router = require('salak-router')
const Joi = require('joi')

const app = new Koa()
const router = new Router()

router.addRoute({
  path: '/test',
  methods: 'GET',
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

app.use(bodyParser())
app.use(router.routes())

app.listen(3000)
