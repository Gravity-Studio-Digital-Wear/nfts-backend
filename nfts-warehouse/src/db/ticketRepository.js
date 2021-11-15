const { WearTicket } = require('./schema')

const listTicketsByAddress = async(address) => {
    const result = await WearTicket.find({'address': new RegExp(`^${address}$`, 'i')})
    console.log(`DB listTicketsByAddress got ${result.length} tickets for ${address}`)
    return result
}

const getTicket = async (id) => {
    const result = await WearTicket.findById(id)
    return result
}

const wear = async(id, address, sourceImageLinks) => {
    const ticket = await WearTicket.findById(id)
    if (ticket.status != 'NEW' && ticket.status != 'REJECTED') {
        throw new Error('Ticket already spent')
    }
    if (ticket.address.toLowerCase() != address.toLowerCase()) {
        throw new Error('Not ticket owner')
    }
    if (!sourceImageLinks || !sourceImageLinks.length) {
        throw new Error('Invalid image list')
    }

    ticket.status = 'PROCESSING'
    ticket.sourceImageLinks = sourceImageLinks
    ticket.updatedAt = new Date()
    
    const result = await ticket.save()
    return result
}

const provideResult = async(id, resultImageLinks) => {
    const ticket = await WearTicket.findById(id)
    if (ticket.status != 'PROCESSING') {
        throw new Error('Ticket already processed')
    }
    if (!resultImageLinks || !resultImageLinks.length) {
        throw new Error('Invalid image list')
    }

    ticket.status = 'DONE'
    ticket.resultImageLinks = resultImageLinks
    ticket.updatedAt = new Date()
    
    const result = await ticket.save()
    return result
}

const provideRejection = async(id, rejectComment) => {
    const ticket = await WearTicket.findById(id)
    if (ticket.status != 'PROCESSING') {
        throw new Error('Ticket already processed')
    }
    if (!rejectComment) {
        throw new Error('Invalid rejectComment')
    }

    ticket.status = 'REJECTED'
    ticket.rejectComment = rejectComment
    ticket.updatedAt = new Date()
    
    const result = await ticket.save()
    return result
}

module.exports = {
    getTicket,
    listTicketsByAddress,
    wear,
    provideResult,
    provideRejection
}