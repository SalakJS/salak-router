const assert = require('assert')
const http = require('http')
const request = require('supertest')
const Koa = require('koa')
const Joi = require('joi')
const bodyParser = require('koa-bodyparser')
const Router = require('..')

describe('Router', () => {
  describe('Test Request', () => {
    let server
    beforeEach(() => {
      const app = new Koa()
      const router = new Router()
      router.addRoute({
        path: '/test',
        method: ['GET'],
        validate: {
          query: {
            id: Joi.number().required()
          },
          responses: {
            200: {
              body: {
                code: Joi.number(),
                msg: Joi.string()
              }
            }
          }
        }
      }, async (ctx) => {
        ctx.body = {
          code: 0,
          msg: 'ok'
        }
      })

      server = http.createServer(app.use(router.routes()).callback())
    })

    it('Success', (done) => {
      request(server)
        .get('/test?id=123')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          assert.deepEqual({ code: 0, msg: 'ok' }, JSON.parse(res.text))
          done()
        })
    })

    it('Failure', (done) => {
      request(server)
        .get('/test')
        .expect(400)
        .end((err) => {
          if (err) {
            return done(err)
          }

          done()
        })
    })
  })

  describe('Test Responses', () => {
    let server

    beforeEach(() => {
      const app = new Koa()
      app.use(bodyParser())

      const router = new Router()
      router.addRoute({
        path: '/test',
        method: 'POST',
        validate: {
          body: {
            username: Joi.string().required(),
            password: Joi.string().required()
          },
          responses: {
            200: {
              body: Joi.array().items(Joi.number())
            }
          }
        }
      }, async (ctx) => {
        ctx.body = [1, 2, 3]
      })

      router.addRoute({
        path: '/demo',
        method: 'POST',
        validate: {
          formData: {
            username: Joi.string().required(),
            email: Joi.string().email().required()
          },
          responses: {
            200: {
              body: Joi.string()
            }
          }
        }
      }, async (ctx) => {
        ctx.body = {
          code: 0
        }
      })

      app.on('error', () => {})

      server = http.createServer(app.use(router.routes()).callback())
    })

    it('Success', (done) => {
      request(server)
        .post('/test')
        .send({
          username: 'wengeek',
          password: '123456'
        })
        .expect(200)
        .end((err) => {
          if (err) {
            return done(err)
          }

          done()
        })
    })

    it('Failure', (done) => {
      request(server)
        .post('/demo')
        .send({
          username: 'wengeek',
          email: 'xxx.xxx@xxx.com'
        })
        .expect(500)
        .end((err) => {
          if (err) {
            return done(err)
          }

          done()
        })
    })
  })
})
