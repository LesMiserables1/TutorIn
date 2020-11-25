const express = require('express')
const cors = require('cors')
const model = require('./models.js')
const crypto = require('crypto')
const jwt = require("jsonwebtoken");
const verifyToken = require('./verifyToken.js');
const multer = require('multer')
const {Op, where} = require('sequelize')
const path = require('path')
let app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('public'))

// api untuk register siswa
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
            status : 'false'
        })
    }
})

// api untuk login siswa
app.post('/siswa/login',async(req,res)=>{
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    const siswa = await model.siswa.findOne({where : { email: body.email, password: passwordHash }})
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

// api untuk update data siswa
app.post('/siswa/update',verifyToken,async(req,res)=>{
    let body = req.body
    
    if(req.decode.role != 'siswa'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }
    let siswa = await model.siswa.findByPk(req.decode.id)
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

// api untuk mendapatkan data siswa
app.post('/siswa/retrieve/data',verifyToken,async(req,res)=>{
    if(req.decode.role != 'siswa'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }
    const siswa = await model.siswa.findByPk(req.decode.id)
    
    res.send({
        "status" : 'ok',
        "data" : siswa
    })
})

// api untuk siswa mencari tutor berdasarkan topik
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

// api untuk siswa booking tutor
app.post('/siswa/book', verifyToken, async(req, res) => {
    let body = req.body
    if(req.decode.role != 'siswa'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }
    
    const session = await model.tutoring_session.create({
        siswaId : req.decode.id,
        topicId : body.topicId,
        date : body.date,
        time : body.time,
        status : "UNPAID"
    })
    
    return res.send({
        "status" : "ok",
        "sessionId" : session.id
    })
})

// api untuk siswa mengambil data tutoring session
app.post('/siswa/retrieve/session',verifyToken, async(req,res)=>{
    if(req.decode.role != 'siswa'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }
    let session = await model.tutoring_session.findAll(
        {
            include : {
                model : model.topic,
                include : [model.tutor]
            }
        },{where : {siswaId : req.decode.id}})
    console.log(session)
    return res.send({
        status : "ok",
        data : session
    })
})

// api untuk siswa membayar tutoring session
app.post('/siswa/checkout', verifyToken, async(req, res) => {
    let body = req.body
    if(req.decode.role != 'siswa'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }
    
    const session = await model.tutoring_session.findByPk(body.sessionId)
    console.log(session)
    session.status_siswa = 'PAID'   
    session.save()
    
    const transaction = model.transaction.create({
        tutoringSessionId : body.sessionId,
    })
    
    return res.send({
        "status" : "ok"
    })
})

//api untuk register tutor
app.post('/tutor/register',async(req,res)=>{
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    try {
        const tutor = await model.tutor.create({
            "email" : body.email,
            "password" : passwordHash,
            "nomor_hp" : body.nomor_hp,
            "nama" : body.nama
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

// api untuk login tutor
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

// api untuk update data tutor
app.post('/tutor/update',verifyToken,async(req,res)=>{
    let body = req.body

    if(req.decode.role != 'tutor'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }
    let tutor = await model.tutor.findByPk(req.decode.id)
    if(tutor == null || tutor.status == 'UNVERIFIED'){
        return res.send({
            "status" : "failed",
            "msg" : "user does not exist or not verified",
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
            topic : body.topik,
            tutorId : req.decode.id
        })
    }
    tutor.save()
    
    return res.send({
        status : "ok"
    })
})  

// api untuk mendapatkan data tutor
app.post('/tutor/retrieve/data',verifyToken,async(req,res)=>{
    if(req.decode.role != 'tutor'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const tutor = await model.tutor.findByPk(req.decode.id,{include : model.topic})
    if(tutor == null || tutor.status == 'UNVERIFIED'){
        return res.send({
            "status" : "failed",
            "msg" : 'user does not exist or not verified'
        })
    }
    return res.send({
        "status" : 'ok',
        "data" : tutor
    })
})

// api untuk mendapatkan tutoring session
app.post('/tutor/retrieve/session',verifyToken,async(req,res)=>{
    if(req.decode.role != 'tutor'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const session = await model.tutoring_session.findAll({include : model.siswa},{where : {status_siswa : "VERIFIED"}})
    return res.send({
        "status" : 'ok',
        "data" : session
    })
})

// api untuk mengupdate link meet
app.post('/tutor/update/link', verifyToken, async(req,res)=>{
    let body = req.body
    if(req.decode.role != 'tutor'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const session = await model.tutoring_session.findByPk(body.sessionId)
    session.link = body.link
    session.save()
    
    return res.send({
        "status" : 'ok',
    })
})

// api untuk request payment
app.post('/tutor/request/payment', verifyToken, async(req, res) => {
    let body = req.body
    if(req.decode.role != 'tutor'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const transaction = await model.tutoring_session.findByPk(body.sessionId,{include : model.transaction})
    transaction.transaction.status_tutor = 'REQUESTED'
    transaction.transaction.nomor_trf = body.nomor_trf
    transaction.transaction.save()

    return res.send({
        "status" : "ok",
    })
})

//api untuk login admin
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
 
// api admin untuk mendapatkan tutor yang belum di verified
app.post('/admin/retrieve/tutor',verifyToken,async(req,res)=>{
    if(req.decode.role != 'admin'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    let tutor = await model.tutor.findAll({where : {status : "UNVERIFIED"}})
    return res.send({
        "status" : 'ok',
        "data" : tutor
    })
})

// api untuk admin verify tutor
app.post('/admin/verify/tutor', verifyToken, async(req,res)=>{
    let body = req.body
    if(req.decode.role != 'admin'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const tutor = await model.tutor.findByPk(body.tutorId)
    tutor.status = 'VERIFIED'
    tutor.save()

    return res.send({
        "status" : 'ok'
    })
})

// api untuk mendapatkan payment siswa
app.post('/admin/retrieve/siswa/payment',verifyToken,async(req,res)=>{
    let body = req.body
    if(req.decode.role != 'admin'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const session = await model.tutoring_session.findAll({include : model.transaction,where : {status_siswa : "PAID"}})
    // const transaction = session.transaction
    
    return res.send({
        "status" : 'ok',
        "data" : session
    })
})

// api untuk verify payment siswa
app.post('/admin/verify/siswa/payment', verifyToken, async(req,res)=>{
    let body = req.body
    if(req.decode.role != 'admin'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }
    
    const transaction = await model.transaction.findByPk(body.transactionId,{include : model.tutoring_session})
    transaction.tutoring_session.status_siswa = 'VERIFIED'
    transaction.tutoring_session.save()
    
    return res.send({
        "status" : 'ok'
    })
})

// api untuk mendapatkan pembayaran tutor
app.post('/admin/retrieve/tutor/payment',verifyToken,async(req,res)=>{
    if(req.decode.role != 'admin'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }
    let transaction = await model.transaction.findAll({where : {status_tutor : "REQUESTED"}})

    return res.send({
        status : "ok",
        data : transaction
    })
})

// api untuk membayar tutor
app.post('/admin/send/tutor/payment', verifyToken, async(req,res)=>{
    let body = req.body
    if(req.decode.role != 'admin'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const transaction = await model.transaction.findByPk( body.transactionId)
    transaction.status_tutor = 'PAID'
    transaction.save()
    
    return res.send({
        "status" : 'ok'
    })
})

app.listen(process.env.APP_PORT)
