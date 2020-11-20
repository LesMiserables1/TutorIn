const jwt = require('jsonwebtoken')

let verifyToken = (req,res,next)=>{
    let token = req.header('auth-token')
    
    jwt.verify(token,process.env.SECRET_KEY,(err,decode)=>{
        if(err){
            return res.send({status:'failed',msg:"invalid token"})
        }
        req.decode = decode
        next()
    })
}

module.exports = verifyToken