const AwsS3Form = require("aws-s3-form")

if (!process.env.AWS_ACCESS_KEY) {
    console.error(`Define AWS_ACCESS_KEY`)
    process.exit(0)
}

if (!process.env.AWS_SECRET_KEY) {
    console.error(`Define AWS_SECRET_KEY`)
    process.exit(0)
}

if (!process.env.AWS_REGION) {
    console.error(`Define AWS_REGION`)
    process.exit(0)
}
if (!process.env.AWS_BUCKET) {
    console.error(`Define AWS_BUCKET`)
    process.exit(0)
}
if (!process.env.AWS_ACTION) {
    console.error(`Define AWS_ACTION`)
    process.exit(0)
}

const AWS_PARMETERS = {
    access: process.env["AWS_ACCESS_KEY"],
    secret: process.env["AWS_SECRET_KEY"],
    region: process.env["AWS_REGION"],
    bucket: process.env["AWS_BUCKET"],
    action: process.env["AWS_ACTION"]
}

const getSignedPolicy = (filename) => {
    var formGen = new AwsS3Form({
        accessKeyId: AWS_PARMETERS.access,
        secretAccessKey: AWS_PARMETERS.secret,
        region: AWS_PARMETERS.region,
        bucket: AWS_PARMETERS.bucket,
        acl: "public-read"
    })
    const result = formGen.create(filename)
    result.action = action
    return result
}

module.exports = {
    getSignedPolicy
}