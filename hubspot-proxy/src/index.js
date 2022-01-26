const url = require('url');

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const API_KEY = '17c0097f-bd91-45f7-93fe-ab7595ec72d8';

app.use(
  '/hubspot',
  createProxyMiddleware({
    target: 'https://api.hubapi.com',
    changeOrigin: true,

    onProxyReq(proxyReq, req, res,options) {
      const parsed = url.parse(proxyReq.path, true);

      parsed.query['hapikey'] = API_KEY

      proxyReq.path = url.format({pathname: parsed.pathname, query: parsed.query}, {});
    },

    pathRewrite: {
      '^/hubspot/': '/',
    }
  })
);

app.listen(3003);