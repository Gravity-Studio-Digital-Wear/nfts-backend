const express = require('express');

const hubspot = require('@hubspot/api-client')

if (!process.env.HUBSPOT_API_KEY) {
  console.error("HUBSPOT_API_KEY is required!")
  process.exit(0)
}

const app = express();

app.use(express.json());

const jsonErrorHandler = async (err, req, res, next) => {
  console.error(err)
  if (JSON.stringify(err) === '{}') {
    res.status(500).json({error: err.message});
  } else {
    res.status(500).json({error: err});
  }
}

const API_KEY = process.env.HUBSPOT_API_KEY;
const hubspotClient = new hubspot.Client({apiKey: API_KEY})

app.get('/hubspot/blog/posts', async (req, res) => {
  const qs = {}

  if (req.query.tagId) {
    qs["tagId__eq"] = req.query.tagId
  }

  const blogResp = await hubspotClient.apiRequest({
    method: 'GET',
    path: '/cms/v3/blogs/posts',
    qs
  })

  return res.json(blogResp.body)
})


app.get('/hubspot/blog/posts/:id', async (req, res) => {
  const blogResp = await hubspotClient.cms.blogs.blogPosts.blogPostApi.getById(req.params.id);

  return res.json(blogResp.body)
})

app.get('/hubspot/blog/posts/:id/related', async (req, res) => {
  const blogResp = await hubspotClient.cms.blogs.blogPosts.blogPostApi.getById(req.params.id);

  const [getByTags, allPosts] = await Promise.all([
    hubspotClient.apiRequest({
      method: 'GET',
      path: '/cms/v3/blogs/posts',
      qs: {
        "tagId__in": blogResp.body.tagIds.join(',')
      }
    }),
    hubspotClient.cms.blogs.blogPosts.blogPostApi.getPage()
  ]);

  const byTags = getByTags.body.results.map(p => p.id)

  const results = [...getByTags.body.results, ...allPosts.body.results.filter(r => !byTags.includes(r.id))]
    .filter((r) => {
      return r.id !== req.params.id
    })

  return res.json(results.slice(0, 3))
})

app.get('/hubspot/blog/tags', async (req, res) => {
  const blogResp = await hubspotClient.cms.blogs.tags.tagApi.getPage();

  return res.json(blogResp.body)
})

app.post('/hubspot/contacts', async (req, res) => {
  const blogResp = await hubspotClient.crm.contacts.basicApi.create({
    properties: {
      "email": req.body.email,
    }
  })

  return res.json(blogResp.body)
})

app.use(jsonErrorHandler);
console.log(`Application is runnig on 3013`)
app.listen(3013);