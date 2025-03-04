const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()
app.use(express.json())
app.use(cookieParser())


mongoose.connect(process.env.MONGO_URI)
    .then(()=>console.log('Connected to MongoDB'))
    .catch((er)=> console.error(error))

const UserSchema = new mongoose.Schema({
    username: String,
    password: String
})

const User = mongoose.model('User', UserSchema)

let refreshTokens=[]

app.post('/auth', async(req,res)=>{
    const {username, password} = req.body
    let user = await User.findOne({username})
    if (!user){
        const hashedPassword = await bcrypt.hash(password,10)
        user = new User({username, password: hashedPassword})
        await user.save();
    }else{
        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) return res.sendStatus(403)
    }
    
    const accessToken = jwt.sign({userId: user._id}, process.env.ACCESS_KEY, {expiresIn:'15m'})
    const refreshToken = jwt.sign({userId: user._id}, process.env.REFRESH_KEY)
    refreshTokens.push(refreshToken)

    res.cookie('accessToken', accessToken, {
        httpOnly: true
    })
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true
    })
    res.json({message: 'Authenticated'})
})

app.get('/refresh-token', async(req,res)=>{
    const {refreshToken} = req.cookies
    if (!refreshToken||!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    
    jwt.verify(refreshToken, process.env.REFRESH_KEY, (err,user)=>{
        if (err) return res.sendStatus(403)
        
        const accessToken = jwt.sign({userId: user.userId}, process.env.ACCESS_KEY, {expiresIn:'15m'})
        res.cookie('accessToken', accessToken, {
            httpOnly: true
        })
        res.json({message:'Successful'})
    })
})

const port=3000
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});