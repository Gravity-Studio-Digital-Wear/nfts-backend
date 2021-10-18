const { Template } = require('./schema')

const saveTemplate = async (template) => {
    let existing = await Template.findById(template._id)
    if (!existing) {
        existing = new Template(template)
    }
    Object.assign(existing, template)
    existing = await existing.save()
    return existing
}

const getTemplate = async (id) => {
    let existing = await Template.findById(id)
    return existing
}

module.exports = {
    getTemplate, 
    saveTemplate
}