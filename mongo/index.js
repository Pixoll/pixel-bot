const mongoose = require('mongoose')
const { CommandoClient } = require('../command-handler/typings')

/**
 * Establishes a permanent connection with MongoDB
 * @param {CommandoClient} client
 */
module.exports = async client => {
    client.emit('debug', 'Connecting to MongoDB...')

    await mongoose.connect(process.env.MONGO_PATH, {
        keepAlive: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

    client.emit('debug', 'Connected to MongoDB')

    return mongoose
}