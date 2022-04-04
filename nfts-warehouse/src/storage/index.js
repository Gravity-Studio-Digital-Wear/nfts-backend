const express = require("express");
const router = express.Router();
const AWS = require('aws-sdk');
const busboy = require('busboy');
const {v4} = require('uuid');
const stream = require("stream");
const {verifyToken} = require("../jwt/jwt");

function ensureEnv(key) {
  if (!process.env[key]) {
    console.error(`Define ${key}`)
    process.exit(0)
  }
}

ensureEnv('AWS_ACCESS_KEY');
ensureEnv('AWS_SECRET_KEY');
ensureEnv('AWS_BUCKET');
ensureEnv('AWS_REGION');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION
});

router.post('/upload', verifyToken('ADMIN'),(req, res) => {
  const bb = busboy({headers: req.headers});

  bb.on('file', (name, file, info) => {
    const pass = () => {
      const pass = new stream.PassThrough();
      const params = {
        Bucket: 'gravity-the-studio--bucket',
        Key: v4() + '-' + info.filename,
        Body: pass
      };

      s3.upload(params, function (err, data) {
        res.status(200).json({
          message: 'success',
          url: data.Location
        })
      });
      return pass
    }

    file.pipe(pass());
  });

  bb.on('close', () => {
    console.log('file uploaded');
  });

  return req.pipe(bb);
})

module.exports = router;

