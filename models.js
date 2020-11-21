require('dotenv').config()

const { Sequelize,DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME,process.env.DB_PASSWORD,{
  host : 'dev-story.my.id',
  dialect : 'mysql',
  port : process.env.DB_PORT
})

const siswa = sequelize.define('siswa',{
  id : { 
    type : DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement : true
  },
  email : {
    type : DataTypes.STRING,
    unique : true
  },
  password : {
    type : DataTypes.STRING
  },
  nama :{
      type : DataTypes.STRING
  },
  nomor_hp : {
      type : DataTypes.STRING
  }
})


const tutor = sequelize.define('tutor',{
  id : { 
    type : DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement : true
  },
  email : {
    type : DataTypes.STRING,
    unique : true
  },
  password : {
    type : DataTypes.STRING
  },
  nama :{
      type : DataTypes.STRING
  },
  nomor_hp : {
      type : DataTypes.STRING
  },
  deskripsi : {
    type : DataTypes.STRING
  },
  //VERIFIED or UNVERIFIED
  status :{
    type : DataTypes.STRING,
    defaultValue: 'UNVERIFIED'
  }
})
const topic = sequelize.define('topic',{
  id : { 
    type : DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement : true
  },
  topic : {
    type : DataTypes.STRING
  }
})

const admin = sequelize.define('admin',{
  id : { 
    type : DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement : true
  },
  email : {
    type : DataTypes.STRING,
    unique : true
  },
  password : {
    type : DataTypes.STRING
  },
  nama :{
      type : DataTypes.STRING
  },
  nomor_hp : {
      type : DataTypes.STRING
  },
  gender : {
    type : DataTypes.STRING
  },
  tanggal_lahir : {
    type : DataTypes.DATE
  }
})


const tutoring_session = sequelize.define('tutoring_session',{
  id : { 
    type : DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement : true
  },
  date : {
    type : DataTypes.DATE
  },
  //UNPAID, PAID, VERIFIED
  status : {
    type : DataTypes.STRING,
  },
  link :{
    type : DataTypes.STRING,
  }
})

tutor.hasMany(topic)
topic.belongsTo(tutor)

siswa.hasMany(tutoring_session)
tutoring_session.belongsTo(siswa)

topic.hasMany(tutoring_session)
tutoring_session.belongsTo(topic)

sequelize.sync({force : false})

module.exports = {
  siswa : siswa,
  tutor : tutor,
  admin : admin,
  tutoring_session : tutoring_session,
  topic : topic
}
