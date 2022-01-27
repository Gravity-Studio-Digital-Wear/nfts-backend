const express = require('express');

const hubspot = require('@hubspot/api-client')

const app = express();

app.use(express.json());

const jsonErrorHandler = async (err, req, res, next) => {
  console.error(err)
  if (JSON.stringify(err) === '{}') {
    res.status(500).json({ error: err.message });
  } else {
    res.status(500).json({ error: err });
  }
}

const API_KEY = '17c0097f-bd91-45f7-93fe-ab7595ec72d8';
const hubspotClient = new hubspot.Client({ apiKey:  API_KEY })

app.get('/hubspot/blog/posts', async (req, res) => {
  const blogResp = await hubspotClient.cms.blogs.blogPosts.blogPostApi.getPage();

  return res.json(blogResp.body)
})

app.use(jsonErrorHandler);

app.listen(3003);