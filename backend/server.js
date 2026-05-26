const {Pool} = require('pg')
const {rateLimit} =  require('express-rate-limit')
const express = require('express')
const bcrypt = require('bcrypt')
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const app = express()
app.use(cookieParser())
const jsonwebtoken = require('jsonwebtoken')
const limiter = rateLimit({
    windowMs:15 * 60 * 1000,
    max:100,
    message:"Too many requests from this IP, please try again after 15 minutes",
    statusCode:429
})
const db = new Pool({
    user:process.env.USER,
    host:process.env.HOST,
    database:process.env.DATABASE,
    password:process.env.PASSWORD,
    port:process.env.PORT,
})
// Configure CORS to allow specific origins and handle preflight requests
const allowedOrigins = process.env.FRONTEND_ORIGIN ? process.env.FRONTEND_ORIGIN.split(',') : ['http://localhost:3000']
const corsOptions = {
    origin: function(origin, callback){
        // allow requests with no origin like mobile apps or curl
        if(!origin) return callback(null, true)
        if(allowedOrigins.indexOf(origin) !== -1){
            return callback(null, true)
        }
        return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(express.json())
function verifyToken(token,uuid){
    try{
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET)
    return decoded.userid == uuid
    } catch(err){
        return false
    }
}
function validateEmail(email){
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return re.test(email)
}
app.post('/getTransactionCategories',async(req,res)=>{
    if(verifyToken(req.cookies.token,req.body.userid) === false){
        return res.json("401: Unauthorized")
    }
    const returnData = await db.query("SELECT transactiontypes from users where id = $1",[req.body.userid])
    return res.json(Object.values(returnData.rows[0])[0])
})
app.post('/deleteTransactionCategories',async(req,res)=>{
    if(verifyToken(req.cookies.token,req.body.userid) === false){
        return res.json("401: Unauthorized")
    }
    const returnData = await db.query("UPDATE users set Transactiontypes = $1 Where id = $2",['{' + req.body.newCategories.join(',') + '}',req.body.userid],(err,result)=>{
        if(err){
            return res.json("400: Bad request - Error occurred")
        } else{
            return res.json("Success")
        }
    })
})
app.post('/getTransactions',async(req,res)=>{
    if(verifyToken(req.cookies.token,req.body.userid) === false){
        return res.json("401: Unauthorized")
    }
    if(req.body.type !== '' && req.body.category !== ''){
        const returnData = await db.query("SELECT * FROM transactions WHERE id = $1 AND transactiontype = $2 AND transactioncategory = $3",[req.body.userid,req.body.type,req.body.category])
        return res.json(returnData.rows)
    }
    else if(req.body.type !== '' && req.body.category === ''){
        const returnData = await db.query("SELECT * FROM transactions WHERE id = $1 AND transactiontype = $2",[req.body.userid,req.body.type])
        return res.json(returnData.rows)
    }
    else if(req.body.type === '' && req.body.category !== ''){
        const returnData = await db.query("SELECT * FROM transactions WHERE id = $1 AND transactioncategory = $2",[req.body.userid,req.body.category])
        return res.json(returnData.rows)
    }
    const returnData = await db.query("SELECT * FROM transactions WHERE id = $1",[req.body.userid])
    return res.json(returnData.rows)
})
app.post('/getUser',async(req,res)=>{
    if(verifyToken(req.cookies.token,req.body.userid) === false){
        return res.json("401: Unauthorized")
    }
    const returnData = await db.query("SELECT id,username,registereddate,email from USERS where id = $1",[req.body.userid])
    return res.json(returnData.rows[0])
})
app.post('/verify',async(req,res)=>{
    const isVerified = await verifyToken(req.cookies.token,req.body.userid)
    return res.json(isVerified)
})
app.post('/register',async(req,res)=>{
    async function doesEmailExist(email){
        const returnData = await db.query("SELECT email from users where email = $1",[email])
        return returnData.rows.length > 0
    }
    if(await doesEmailExist(req.body.email)){
        return res.json("400: Bad request - Email already exists")
    }
    if(!validateEmail(email)){
        return res.json("400: Bad request - Incorrect email")
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    db.query("INSERT INTO users(email,password,username,registereddate) VALUES($1,$2,$3,$4)", [req.body.email,hashedPassword,req.body.username, new Date()], (err,result) =>{
        if(err){
            return res.json("400: Bad request - Error occurred while registering")
        } else{
            return res.json("Success")
        }
    })
})
app.post('/addTransactionCategory',async(req,res)=>{
    if(verifyToken(req.cookies.token,req.body.userid) === false){
        return res.json("401: Unauthorized")
    }
    await db.query("UPDATE users set transactiontypes = transactiontypes || $1 where id = $2",[`{${req.body.category}}`,req.body.userid],(err,result)=>{
        if(err){
            return res.json("400: Bad request - Error occurred while adding transaction category")
        }
        else{
            return res.json("Success")
        }
    })
})
app.post('/addTransaction',async(req,res)=>{
    if(verifyToken(req.cookies.token,req.body.userid) === false){
        return res.json("401: Unauthorized")
    }
    db.query("INSERT INTO transactions(id,transactiondata,transactiontype,title,transactiondate,transactioncategory) VALUES($1,$2,$3,$4,$5,$6)", [req.body.userid,req.body.amount,req.body.type,req.body.title,new Date(),req.body.category], (err,result) =>{
        if(err){
            return res.json("400: Bad request - Error occurred while adding transaction")
        } else{
            return res.json("Success")
        }
    })
})
app.post('/changeCredentials',async(req,res)=>{
    if(verifyToken(req.cookies.token,req.body.userid) === false){
        return res.json("401: Unauthorized")
    }
    async function verifyPasswords(pass){
        const returnData = await db.query("SELECT password from users where id = $1",[req.body.userid])
        return bcrypt.compare(pass, returnData.rows[0].password)
    }
    if(!await verifyPasswords(req.body.currentPassword)){
            return res.json("400: Bad request - Current password is incorrect")
        }
    if(req.body.type === 'password'){
        db.query("UPDATE users SET password = $1 where id = $2",[await bcrypt.hash(req.body.newPassword,10),req.body.userid],(err,result)=>{
            if(err){
                return res.json("400: Bad request - Error occurred while updating password")
            }
            else{
                return res.json("Success")
            }
        })
    }
    else if(req.body.type === 'email'){
        if(!validateEmail(req.body.email)){
            return res.json("400: Bad request - Incorrect email")
        }
        db.query("UPDATE users SET email = $1 where id = $2",[req.body.email,req.body.userid],(err,result)=>{
            if(err){
                return res.json("400: Bad request - Error occurred while updating email")
            }
            else{
                return res.json("Success")
            }
        })
    }
    else if(req.body.type === 'username'){
        db.query("UPDATE users SET username = $1 where id = $2",[req.body.newUsername,req.body.userid],(err,result)=>{
            if(err){
                return res.json("400: Bad request - Error occurred while updating username")
            }
            else{
                return res.json("Success")
            }
        })
    }
})
app.delete('/deleteTransaction',async(req,res)=>{
    if(verifyToken(req.cookies.token,req.body.userid) === false){
        return res.json("401: Unauthorized")
    }
    db.query("DELETE from transactions where transactionid = $1 and id = $2",[req.body.transactionid,req.body.userid],(err,result)=>{
        if(err){
            return res.json("400: Bad request - Error occurred while deleting transaction")
        }
        else{
            return res.json("Success")
        }
    })
})
app.post('/login',async(req,res)=>{
    const returnData = await db.query("SELECT * FROM users WHERE email = $1",[req.body.email])
    if(returnData.rows.length === 0){
        return res.json("400: Bad request - User not found")
    }else {
        if(await bcrypt.compare(req.body.password, returnData.rows[0].password)){
            const token = jsonwebtoken.sign({userid:returnData.rows[0].id}, process.env.JWT_SECRET,{expiresIn:'14d'})
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 14
            })
            const id = await db.query("SELECT id from users where email = $1",[req.body.email])
            return res.json({message:"Success", userid:id.rows[0].id})
        } else{
            return res.json("400: Bad request - Invalid password")
        }
    }
})
app.post('/logout',async(req,res)=>{
    if(verifyToken(req.cookies.token,req.body.userid) === false){
        return res.json("401: Unauthorized")
    }
    await res.clearCookie('token')
    return res.json("200: Success")
})
app.listen(8080)