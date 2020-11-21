const express = require('express')
const cors = require('cors')
const model = require('./models.js')
const crypto = require('crypto')
const jwt = require("jsonwebtoken");
const verifyToken = require('./verifyToken.js');
const multer = require('multer')
const fs = require('fs').promises
const path = require('path');
const {Op} = require('sequelize')

let app = express()
let upload = multer({dest : 'uploads/'})
app.use(express.json())
app.use(cors())
// api untuk siswa


app.post('/siswa/register',async(req,res)=>{
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    try {
     
        const siswa = await model.siswa.create({
            "email" : body.email,
            "password" : passwordHash,
            "nama" : body.nama,
            "nomor_hp" : body.nomor_hp
        })
        return res.send({
            status : 'ok'
        })   
    } catch (error) {
        return res.send({

            status
        })
    }
})


app.post('/siswa/login',async(req,res)=>{
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    const siswa = await model.siswa.findOne({ email: body.email, password: passwordHash })
    if (siswa == null) {
        return res.send({
            "status": "failed",
            "message": "wrong credential"
        })
    }
    let payload = {
        "role" : "siswa",
        "id" : siswa.id
    }
    const token = jwt.sign(payload, process.env.SECRET_KEY)
    return res.send({
        "status": "ok",
        token
    })
})

app.post('/siswa/update',verifyToken,async(req,res)=>{
    let body = req.body
    
    if(req.decode.role != 'siswa'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }
    let siswa = await model.siswa.findOne({id : req.decode.id})
    if(body.nama != null)
        siswa.nama = body.nama
    if(body.nomor_hp != null)
        siswa.nomor_hp = body.nomor_hp
    if(body.email != null)
        siswa.email = body.email
    if(body.new_password != null){
        let passwordHash = crypto.createHash('sha256').update(body.new_password).digest('base64')
        siswa.password = passwordHash
    }
    siswa.save()
    
    return res.send({
        status : "ok"
    })
})  

app.post('/siswa/retrieve/data',verifyToken,async(req,res)=>{
    if(req.decode.role != 'siswa'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }
    const siswa = await model.siswa.findOne({id : req.decode.id})
    
    res.send({
        "status" : 'ok',
        "data" : siswa
    })
})

//search tutor berdasarkan topik yg diajar(?) --> masih harus di fix
app.post('/siswa/search/tutor',verifyToken,async(req,res)=>{
    if(req.decode.role != 'siswa'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    let body = req.body
    let topic = await model.topic.findAll({
        include : model.tutor,
        where : {
            topic : {
                [Op.like] : `%${body.query}%`
            }
        }
    })
    return res.send({
        "status" : "ok",
        data : topic
    })
})

app.post('/siswa/book', verifyToken, async(req, res) => {
    let body = req.body
    if(req.decode.role != 'siswa'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const session = model.tutoring_session.create({
        customerId: req.decode.id,
        tutorId: body.tutorId,
        date : body.date,
        fee : body.fee,
        status : "UNPAID"
    })

    return res.send({
        "status" : "ok",
    })
})

//payment transaction
app.post('/siswa/checkout', verifyToken, async(req, res) => {
    let body = req.body
    if(req.decode.role != 'siswa'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const session = await model.tutoring_session.findOne({id : body.id})
    session.status = 'PAID'
    session.save()
    
    const transaction = model.transaction.create({
        tutoring_sessionId : body.id,
        status_siswa : "UNVERIFIED"
    })
    
    return res.send({
        "status" : "ok",
    })
})

//api untuk tutor
app.post('/tutor/register',async(req,res)=>{
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    try {
        const tutor = await model.tutor.create({
            "email" : body.email,
            "password" : passwordHash
        })   
        return res.send({
            status : 'ok'
        })
    } catch (error) {
        return res.send({
            status : 'failed',
            msg : "email is already registered"
        })
    }
})

app.post('/tutor/login',async(req,res)=>{
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    const tutor = await model.tutor.findOne({ where: { email: body.email, password: passwordHash } })
    if (tutor == null) {
        return res.send({
            "status": "failed",
            "message": "kredensial salah"
        })
    }
    let payload = {
        "role" : "tutor",
        "id" : tutor.id
    }
    const token = jwt.sign(payload, process.env.SECRET_KEY)
    return res.send({
        "status": "ok",
        token
    })
})

app.post('/tutor/update',verifyToken,async(req,res)=>{
    let body = req.body

    if(req.decode.role != 'tutor'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }
    let tutor = await model.tutor.findOne({id : req.decode.id})
    if(tutor == null){
        return res.send({
            "status" : "failed",
            "msg" : "user does not exist"
        })
    }
    if(body.nama){
        tutor.nama = body.nama
    }
    if(body.email){
        tutor.email = body.email
    }
    if(body.nomor_hp){
        tutor.nomor_hp = body.nomor_hp
    }
    if(body.deskripsi){
        tutor.deskripsi = body.deskripsi
    }
    if(body.password){
        let passwordHash = crypto.createHash('sha256').update(body.new_password).digest('base64')
        tutor.password = passwordHash
    }
    if(body.topik){
        let topic = model.topic.create({
            topic : body.topic,
            tutorId : req.decode.id
        })
    }
    tutor.save()
    
    return res.send({
        status : "ok"
    })
})  

app.post('/tutor/retrieve/data',verifyToken,async(req,res)=>{
    if(req.decode.role != 'tutor'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const tutor = await model.tutor.findByPk(req.decode.id,{include : model.topic})
    console.log(tutor)
    if(tutor == null){
        return res.send({
            "status" : "failed",
            "msg" : 'user does not exist'
        })
    }
    return res.send({
        "status" : 'ok',
        "data" : tutor
    })
})

app.post('/tutor/retrieve/session',verifyToken,async(req,res)=>{
    if(req.decode.role != 'tutor'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    // const session = await model.tutoring_session.findAll({where: {tutorId : req.decode.id, status = 'VERIFIED'}})

    return res.send({
        "status" : 'ok',
        "data" : session
    })
})

app.post('/tutor/update/link', verifyToken, async(req,res)=>{
    let body = req.body
    if(req.decode.role != 'tutor'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const session = await model.tutoring_session.findOne({id : body.id})
    session.link = body.link
    session.save()
    
    return res.send({
        "status" : 'ok',
        "data" : session
    })
})

app.post('/tutor/upload/berkas',verifyToken,async(req,res)=>{
    let body = req.body
    if(req.decode.role != 'tutor'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const tutor = await model.tutor.findOne({id : req.decode.id})
    tutor.berkas = body.berkas
    tutor.save()
    
    return res.send({
        "status" : 'ok',
    })
})

app.post('/tutor/request/payment', verifyToken, async(req, res) => {
    let body = req.body
    if(req.decode.role != 'tutor'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const transaction = await model.transaction.findOne({tutoring_sessionId : body.id})
    transaction.status_tutor = 'REQUESTED'
    transaction.save()

    return res.send({
        "status" : "ok",
    })
})

//api admin
app.post('/admin/login',async(req,res)=>{
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    const admin = await model.admin.findOne({ where: { email: body.email, password: passwordHash } })
    if (admin == null) {
        return res.send({
            "status": "failed",
            "message": "kredensial salah"
        })
    }
    let payload = {
        "role" : "admin",
        "id" : admin.id
    }
    const token = jwt.sign(payload, process.env.SECRET_KEY)
    return res.send({
        "status": "ok",
        token
    })
})
 
app.post('/admin/retrieve/data',verifyToken,async(req,res)=>{
    
    if(req.decode.role != 'admin'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const admin = await model.admin.findOne({id : req.decode.id})
    if(admin == null){
        return res.send({
            "status" : "failed",
            "msg" : 'user does not exist'
        })
    }
    return res.send({
        "status" : 'ok',
        "data" : admin
    })
})

//liat tutor yang blm diverify
app.post('/admin/retrieve/tutor',verifyToken,async(req,res)=>{
    let body = req.body
    if(req.decode.role != 'admin'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const tutor = await model.tutor.findAll({status : 'UNVERIFIED'})

    return res.send({
        "status" : 'ok',
        "data" : tutor
    })
})

app.post('/admin/verify/tutor', verifyToken, async(req,res)=>{
    let body = req.body
    if(req.decode.role != 'admin'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const tutor = await model.tutor.findOne({id : body.id})
    tutor.status = 'VERIFIED'
    tutor.save()

    return res.send({
        "status" : 'ok',
        "data" : tutor
    })
})

//liat payment siswa yang menunggu untuk di verify
app.post('/admin/retrieve/payment',verifyToken,async(req,res)=>{
    let body = req.body
    if(req.decode.role != 'admin'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const session = await model.tutoring_session.findOne({status : 'PAID'})

    return res.send({
        "status" : 'ok',
        "data" : session
    })
})

app.post('/admin/verify/siswa/payment', verifyToken, async(req,res)=>{
    let body = req.body
    if(req.decode.role != 'admin'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const session = await model.tutoring_session.findOne({id : body.id})
    session.status = 'VERIFIED'
    session.save()
    
    const transaction = await model.transaction.findOne({tutoring_sessionId : body.id})
    transaction.status_siswa = 'VERIFIED'
    transaction.save()
    
    return res.send({
        "status" : 'ok',
        "data" : session
    })
})

//liat tutor yang request payment
app.post('/admin/retrieve/payment',verifyToken,async(req,res)=>{
    let body = req.body
    if(req.decode.role != 'admin'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const transaction = await model.transaction.findAll({status_tutor : 'REQUESTED'})

    return res.send({
        "status" : 'ok',
        "data" : transaction
    })
})

//bayar tutor
app.post('/admin/send/tutor/payment', verifyToken, async(req,res)=>{
    let body = req.body
    if(req.decode.role != 'admin'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const transaction = await model.transaction.findOne({tutoring_sessionId : body.id})
    transaction.status_tutor = 'PAID'
    transaction.save()
    
    return res.send({
        "status" : 'ok',
        "data" : transaction
    })
})



app.listen(3000)
