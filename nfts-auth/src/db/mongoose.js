const mongoose = require('mongoose');

const init = async() => {
    if (!process.env.MONGO_URL) {
        console.error(`Define MONGO_URL`)
        process.exit(0)
    }
    console.log(`Connecting to db...`)
    await mongoose.connect(`${process.env.MONGO_URL}`)
    console.log(`Database connected`)
}

module.exports = {
    init,
    mongoose
}


