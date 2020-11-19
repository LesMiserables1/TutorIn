const express = require('express')
const cors = require('cors')
const model = require('./model.js')
const crypto = require('crypto')
const jwt = require("jsonwebtoken");
const verifyToken = require('./verify.js');

let app = express()
app.use(express.json())
app.use(cors())

// api untuk siswa
/* TO DO:
    1. upload kartu identitas, foto
    2. do/confirm payment, terus jadi dapet tutoring session
    3. get tutoring gmeet link
    4. chat
*/
app.post('/siswa/register',async(req,res)=>{
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    const siswa = await model.siswa.create({
        "email" : body.email,
        "password" : passwordHash
    })
    res.send({
        status : 'ok'
    })
})


app.post('/siswa/login',async(req,res)=>{
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    const siswa = await model.siswa.findOne({ where: { email: body.email, password: passwordHash } })
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
    siswa.nama = body.nama
    siswa.nomor_hp = body.nomor_hp
    admin.gender = body.gender
    siswa.tanggal_lahir = body.tanggal_lahir
    siswa.save()
    
    res.send({
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

//search tutor berdasarkan topik yg diajar(?)
app.post('/siswa/search/tutor',verifyToken,async(req,res)=>{
    if(req.decode.role != 'siswa'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    let body = req.body
    let tutor = await model.tutor.findAll({
        where :{
            topic : {
                [Op.like] : `%${body.query}%`
            }
        }
    })
    return res.send({
        "status" : "ok",
        data : tutor
    })
})

app.post('/siswa/request', verifyToken, async(req, res) => {
    let body = req.body
    if(req.decode.role != 'siswa'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const session = model.tutoring_request.create({
        customerId: req.decode.id,
        tutorId: body.tutorId,
        date : body.date,
        fee : body.fee
    })
})

//api untuk tutor
/* TO DO:
    1. upload berkas, foto
    2. get tutoring gmeet link
    3. chat
    4. get payment
*/
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
    tutor.alamat = body.alamat
    tutor.nama = body.nama
    tutor.nomor_hp = body.nomor_hp
    tutor.kota = body.kota
    tutor.tanggal_lahir = body.tanggal_lahir
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

    const tutor = await model.tutor.findOne({id : req.decode.id})
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

app.post('/tutor/request/view',verifyToken,async(req,res)=>{
    if(req.decode.role != 'tutor'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const request = await model.tutoring_request.findAll({tutorId : req.decode.id})

    return res.send({
        "status" : 'ok',
        "data" : request
    })
})

app.post('/tutor/request/accept',verifyToken,async(req,res)=>{
    if(req.decode.role != 'tutor'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const request = await model.tutoring_request.findOne({id : body.id})
    request.status = "ACCEPTED"
    request.save()

    return res.send({
        "status" : 'ok',
    })
})

app.post('/tutor/request/reject',verifyToken,async(req,res)=>{
    if(req.decode.role != 'tutor'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    const session = await model.tutoring_request.findOne({id : body.id})
    session.status = "REJECTED"
    session.save()
    
    return res.send({
        "status" : 'ok',
    })
})

//api admin
/* TO DO:
    1. see unverified tutor
    2. verify tutor
    3. See user report
    4. solve report
*/
app.post('/admin/register',async(req,res)=>{
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    try {
        const admin = await model.admin.create({
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

app.post('/admin/update',verifyToken,async(req,res)=>{
    let body = req.body

    if(req.decode.role != 'admin'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }
    let admin = await model.admin.findOne({id : req.decode.id})
    if(admin == null){
        return res.send({
            "status" : "failed",
            "msg" : "user does not exist"
        })
    }
    admin.nama = body.nama
    admin.nomor_hp = body.nomor_hp
    admin.gender = body.gender
    admin.tanggal_lahir = body.tanggal_lahir
    admin.save()
    
    return res.send({
        status : "ok"
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



app.listen(3000)