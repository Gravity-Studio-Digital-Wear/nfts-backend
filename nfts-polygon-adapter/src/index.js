const { startProcessing } = require('./alchemy/alchemy')
const { runRepeated } = require('./alchemy/subsciption')
const { startProcessingLogs } = require('./alchemy/logs')

const start = async() => {
    await startProcessing()
    await runRepeated()
    await startProcessingLogs()
}


start()