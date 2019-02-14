'use strict'

/**
 * 自带Joi校验的router
 *
 * 创 建 者：wengeek <wenwei897684475@gmail.com>
 * 创建时间：2017-12-11
 */

const KoaRouter = require('koa-router')
const assert = require('assert')
const debug = require('debug')('salak-router')
const { Joi } = require('salak-joi-to-swagger')

class Router extends KoaRouter {
  /**
   * @constructor
   *
   * @param {Object} opts - 配置
   * @param {number} opts.requestFailure - 请求参数验证不通过状态码
   * @param {number} opts.responseFailure - 响应验证不通过状态码
   * @param {Object} opts.joiOptions - joi 校验配置
   */
  constructor (opts) {
    super(opts)
    this.requestFailure = (opts && opts.requestFailure) || 400
    this.responseFailure = (opts && opts.responseFailure) || 500
    this.ignoreValidateResponses = (opts && opts.ignoreValidateResponses) || false
    this.joiOptions = (opts && opts.joiOptions) || {
      allowUnknown: true
    }
  }

  /**
   * 添加路由
   *
   * @public
   * @param {Object} - 路由配置
   * @param {string} path - 路由地址
   * @param {Array|string} method - 路由请求方式
   * @param {Object} validate - 路由验证参数
   * @param {Function} handler - 路由具体处理逻辑
   */
  addRoute ({ path, method, validate }, handler) {
    method = this._validateMethods(method)

    const validator = this._makeValidator(validate)

    const handlers = [validator, handler]

    method.forEach((item = '') => {
      debug('add %s "%s"', item, path)

      if (typeof super[item] === 'function') {
        super[item].apply(this, [path].concat(handlers))
      }
    })
  }

  _validateMethods (method) {
    let arr = method
    if (typeof method === 'string') {
      arr = method.split(' ')
    }

    if (!Array.isArray(arr)) {
      throw new TypeError('route method must be array or string.')
    }

    if (arr.length === 0) {
      throw new Error('missing route method')
    }

    return arr.map((item) => {
      assert(typeof item === 'string', 'route method must be a string')
      return item.toLowerCase()
    })
  }

  _makeValidateError (error, status, type) {
    error.status = status
    error.type = type

    return error
  }

  _validateProp (item, ctx, schema) {
    let data
    if (ctx.request[item]) {
      data = ctx.request[item]
    } else if (item === 'formData') {
      data = ctx.request.body
    } else if (item === 'params') {
      data = ctx.params
    }

    const res = Joi.validate(data, schema, this.joiOptions)

    if (res.error) {
      return this._makeValidateError(res.error, this.requestFailure, 'RequestValidationError')
    }

    switch (item) {
      case 'header':
        // 请求头不能做修改
        break
      case 'query':
        Object.keys(res.value).forEach((key) => {
          ctx.request[item][key] = res.value[key]
        })
        break
      case 'params':
        Object.keys(res.value).forEach((key) => {
          ctx.params[key] = res.value[key]
        })
        break
      case 'formData':
      case 'body':
        Object.keys(res.value).forEach((key) => {
          ctx.request.body[key] = res.value[key]
        })
        break
      default:
        ctx.request[item] = res.value
        break
    }
  }

  _makeValidator (validate) {
    return async (ctx, next) => {
      if (!validate) {
        await next()
        return
      }

      // 执行前检查
      const props = ['header', 'body', 'query', 'params', 'formData']
      for (let i = 0, length = props.length; i < length; i++) {
        const prop = props[i]

        if (validate[prop]) {
          const error = this._validateProp(prop, ctx, validate[prop])

          if (error) {
            return ctx.throw(error)
          }
        }
      }

      await next()

      // validate output
      const { responses } = validate

      if (!this.ignoreValidateResponses && responses) {
        const error = this._validateOutput(responses, ctx)

        if (error) {
          return ctx.throw(error)
        }
      }
    }
  }

  _validateOutput (responses, ctx) {
    const { status } = ctx

    for (let key in responses) {
      if (this._matchStatus(status, key)) { // 匹配到相应的状态码
        const error = this._validateResponse(ctx, responses[key])

        if (error) {
          return error
        }

        break
      }
    }
  }

  _validateResponse (ctx, spec) {
    if (spec.headers) {
      const res = Joi.validate(ctx.response.headers, spec.headers, this.joiOptions)
      if (res.error) {
        return this._makeValidateError(res.error, this.responseFailure, 'ResponsetValidationError')
      }

      ctx.set(res.value)
    }

    if (spec.body) {
      const res = Joi.validate(ctx.body, spec.body, this.joiOptions)
      if (res.error) {
        return this._makeValidateError(res.error, this.responseFailure, 'ResponsetValidationError')
      }

      ctx.body = res.value
    }
  }

  _matchStatus (status, key = '') {
    // 301,304,400-600
    const resCodes = key.split(',').filter((item = '') => item.trim() !== '')

    for (let item of resCodes) {
      if (item.indexOf('-') !== -1) {
        const codes = item.split('-')
        const lower = +codes[0]
        const upper = +codes[1]

        if (status >= lower && status <= upper) {
          return true
        }
      } else {
        if (status === +item) {
          return true
        }
      }
    }

    return false
  }
}

module.exports = Router
module.exports.Joi = Joi
