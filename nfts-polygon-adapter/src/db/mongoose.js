const mongoose = require('mongoose');

let initialized = false

const init = async() => {
    if (initialized) {
        return
    }
    initialized = true
    if (!process.env.MONGO_USER) {
        console.error(`Define MONGO_USER`)
        process.exit(0)
    }
    if (!process.env.MONGO_PASSWORD) {
        console.error(`Define MONGO_PASSWORD`)
        process.exit(0)
    }
    if (!process.env.MONGO_HOST) {
        console.error(`Define MONGO_HOST`)
        process.exit(0)
    }
    if (!process.env.MONGO_DB) {
        console.error(`Define MONGO_DB`)
        process.exit(0)
    }
    console.log(`Connecting to db...`)
    await mongoose.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:27017/${process.env.MONGO_DB}`)
    console.log(`Database connected`)
}


module.exports = {
    init,
    mongoose
}


