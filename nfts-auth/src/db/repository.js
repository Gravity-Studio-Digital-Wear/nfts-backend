const { User } = require('./schema')
const { mongoose } = require('./mongoose')

const getUser = async(address) => {
    const user = await User.find({address})
    const result = user.length > 0 ? user[0] : undefined
    console.log(`DB getUser found ${user.length} users for address ${address}`)
    return result
}

const saveOrCreateEmptyUser = async(address) => {
    const existing = await getUser(address)
    if (!existing) {
        const user = new User({address})
        await user.save()
        console.log(`DB saveOrCreateEmptyUser created new user with address ${address}`)
    } else {
        console.log(`DB saveOrCreateEmptyUser user with address ${address} exists`)
    }
}

const updateUserDetail = async(address, detail) => {
    const user = await getUser(address)
    Object.assign(user, detail)
    await user.save()
    console.log(`DB updateUserDetail updated user with address ${address} to new details ${JSON.stringify(detail)}`)
}

module.exports = {
    getUser,
    saveOrCreateEmptyUser,
    updateUserDetail
}