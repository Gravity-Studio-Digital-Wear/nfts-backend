const express = require("express");
const Web3 = require('Web3')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { verifyToken } = require('./jwt/jwt')
const { init } = require('./db/mongoose')
const { saveOrCreateEmptyUser, getUser, updateUserDetail } = require('./db/repository')

const app = express();
const web3 = new Web3()

app.use(express.json());

const challenges = {}

if (!process.env.TOKEN_KEY) {
    console.error("TOKEN_KEY is required!")
    process.exit(0)
}

app.post("/auth/challenge", async (req, res) => {
    const { address } = req.body
    const challenge = uuidv4()
    challenges[address] = challenge
    res.status(201).json({
        address,
        challenge
    })
})

app.post("/auth/login", async (req, res) => {
    const { address, signature } = req.body
    try {
        const challenge = challenges[address]
        const recovered = web3.eth.accounts.recover(challenge, signature)
        if (recovered === address) {

            saveOrCreateEmptyUser(address)

            const token = jwt.sign({
                user_id: address,
                address
            },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "72h",
                })
            res.status(201).json({
                token,
                address
            })
            return
        }
    } catch (e) {
        console.error(e)
    }

    res.status(403).json()
})

app.get("/auth/profile", verifyToken, async (req, res) => {
    const address = req.user.user_id
    const result = await getUser(address)
    res.status(200).json(result)
})

app.post("/auth/profile", verifyToken, async (req, res) => {
    const address = req.user.user_id
    const {
        name,
        avatar,
        email,
        instagramLink,
        facebookLink,
        twitterLink,
        tiktokLink,
        avatarUrl
    } = req.body

    await updateUserDetail(address, {
        name,
        avatar,
        email,
        instagramLink,
        facebookLink,
        twitterLink,
        tiktokLink,
        avatarUrl
    })

    const result = await getUser(address)
    res.status(200).json(result)
})

const uuidv4 = () => {
    return [4, 2, 2, 2, 6] // or 8-4-4-4-12 in hex
        .map(group => crypto.randomBytes(group).toString('hex'))
        .join('-');
};

init()
console.log(`Application is runnig on 3001`)
app.listen(3001)