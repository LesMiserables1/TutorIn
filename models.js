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
  },
  gender : {
    type : DataTypes.STRING
  },
  tanggal_lahir : {
    type : DataTypes.DATE
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
  gender : {
    type : DataTypes.STRING
  },
  tanggal_lahir : {
    type : DataTypes.DATE
  },
  topic :{
    type : DataTypes.STRING
  },
  //VERIFIED or UNVERIFIED
  status :{
    type : DataTypes.STRING,
    defaultValue: 'UNVERIFIED'
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

const tutoring_request = sequelize.define('tutoring_request',{
  id : { 
    type : DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement : true
  },
  date : {
    type : DataTypes.DATE
  },
  fee : {
    type : DataTypes.DOUBLE
  },
  //IN, ACCEPTED, REJECTED
  status : {
    type : DataTypes.STRING,
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
  fee : {
    type : DataTypes.DOUBLE
  },
  //UNPAID, PAID
  status : {
    type : DataTypes.STRING,
  },
  link :{
    type : DataTypes.STRING,
  }
})

siswa.hasMany(tutoring_request);
tutoring_request.belongsTo(siswa);

tutor.hasMany(tutoring_request);
tutoring_request.belongsTo(tutor);

tutoring_request.hasOne(tutoring_session);
tutoring_session.belongsTo(tutoring_request);

sequelize.sync({force : false})

module.exports = {
  siswa : siswa,
  tutor : tutor,
  admin : amdin,
  tutoring_request : tutoring_request,
  tutoring_session : tutoring_session
}