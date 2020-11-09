from datetime import date
from datetime import datetime

class User:
    username = None
    _password = None
    name = None
    _email = None
    _userRole = None
    message = None

    def __init__(self,username,password,name,email,userRole):
        self.username = username
        self._password = password
        self.name = name
        self._email = email
        self._userRole = userRole
        self.message = None
        
    def login(self, username,password):
        if (self.username == username) and (self._password == password):
            print('Login Succeeded')
            return True
        else:
            print('Wrong username or password')
            return False

    def verifyAccount(self):
        if (self.username != None) and (self._password != None):
            print('Account Verified')
            return True
        else:
            print('Account not Verified')
            return False

    def forgetPassword(self):
        print('Your password is ',self._password)
        return self._password

    def changePassword(self, new_pw):
        self._password = new_pw
        print('Password successfully changed')
        return True
class Admin(User):
    def verifyUser(self):
        if (self.username != None) and (self._password != None):
            print('Account Verified')
            return True
        else:
            print('Account not Verified')
            return False

    def solveThreadProblem(self):
        print("Thread solved!")
        return True
    
    def verifyPayment(self):
        print("Payment verified!")
        return True
class Siswa(User):
    _siswaId = None
    angkatan = None
    _nomorHp = None
    _identificationCard = None

    def createAccount(self,siswaId,angkatan,nomorHp,identificationCard):
        self._siswaId = siswaId
        self.angkatan = angkatan
        self._nomorHp = nomorHp
        self._identificationCard = identificationCard
        print('Account successfully created')

    def bookTutor(self):
        print('Tutor booked')
        return True

    def sendMessage(self, receiver, pesan):    
        now = datetime.now()
        current_time = now.strftime("%H:%M:%S")
        message = chatMessage(self.username,receiver,current_time)
        message.sendMessage(pesan)  
class Tutor(User):
    _tutorId = None
    lastEducation = None
    _nomorHp = None
    _identificationCard = None
    rating = None

    def createAccount(self,tutorId,lastEducation,nomorHp,identificationCard,rating):
        self._tutorId = tutorId
        self.lastEducation = lastEducation
        self._nomorHp = nomorHp
        self._identificationCard = identificationCard
        self.rating = rating
        print('Account successfully created')
    
    def manageRequest(self):
        print('Show list')
        return True
    
    def sendMessage(self, receiver, pesan):    
        now = datetime.now()
        current_time = now.strftime("%H:%M:%S")
        message = chatMessage(self.username,receiver,current_time)
        message.sendMessage(pesan) 
class chatMessage(User):
    _senderName = None
    _receiveName = None
    _datetime = None
    _chatHistory = []

    def __init__(self,senderName,receiveName,datetime):
        self._senderName = senderName
        self._receiveName = receiveName
        self._datetime = datetime
        self._chatHistory = []
        print('Message successfully created')
        
    def seeMessage(self):
        print(self._chatHistory)
        return self._chatHistory
    
    def sendMessage(self, message):
        self._chatHistory.append(message)
        print(message,' From ',self._senderName,' to ', self._receiveName)
        return self._chatHistory    
class tutoringSession():
    _sessionId = None
    _mentorName = None
    _siswaName = None
    _tutoringPeriod = None
    _paymentStatus = None

    def __init__(self,sessionId,mentorName,siswaName):
        self._sessionId = sessionId
        self._mentorName = mentorName
        self._siswaName = siswaName
        self._tutoringPeriod = None
        self._paymentStatus = False
        print('Session created')

    def bookSchedule(self, date):
        self._tutoringPeriod = date
        print('Calender = ',date)
        return True
class Payment(tutoringSession):
    _mentorFee = None
    _paymentId = None

    def checkOut(self, paymentID, fee):
        self._mentorFee = fee
        self._paymentId = paymentID
        print('Check out succeed')
        return True

    def verifiedBilling(self):
        if (self._paymentId != None):
            self._paymentStatus = True
            print('Status Active')
        return self._paymentStatus
class Thread():
    _threadId = None
    threadTag = None
    threadHeader = None
    senderName = None
    replies = []
    
    def createThread(self,threadId,threadTag,threadHeader,senderName):
        self._threadId = threadId
        self.threadTag = threadTag
        self.threadHeader = threadHeader
        self.senderName = senderName
        print('Thread successfully created')
    
    def replyThread(self, reply):
        self.replies.append(reply)
        print(reply)
        return True

    def removeThread(self):
        self._threadId = None
        print('Thread successfully removed')
        return True
class Post():
    _threadId = None
    text = None

    def writePost(self, text):
        self.text = text
        print('Post successfully removed')
        return True

    def seePost(self):
        print(self.text)
        return self.text
    
    def deletePost(self):
        self.text = None
        print('Post successfully deleted')
        return True

class __main___:
    # User
    user = User('User','password','User','user@gmail.com','User')
    user.login('User','password')
    user.verifyAccount()
    user.forgetPassword()
    user.changePassword('newPassword')

    # Akun Admin
    admin = Admin('Admin','password','Admin','admin@gmail.com','Admin')
    admin.verifyAccount()
    admin.solveThreadProblem()
    admin.verifyPayment()

    # Akun Siswa
    siswa = Siswa('Siswa','password','Siswa','siswa@gmail.com','Siswa')
    siswa.createAccount('S001',2020,'0123456789','identitas siswa')
    siswa.bookTutor()
    siswa.sendMessage('Mark','Pesan')

    # Akun Tutor
    tutor = Tutor('Tutor','password','Tutor','tutor@gmail.com','Tutor')
    tutor.createAccount('T001','Universitas Gadjah Mada','9876543210','identitas tutor','5')
    tutor.manageRequest()
    tutor.sendMessage('Luke','Test')

    # Sesi belajar
    sesi = Payment('001',tutor.name,siswa.name)
    sesi.bookSchedule(date.today())
    sesi.checkOut('P001',100000)
    sesi.verifiedBilling()

    # Thread
    thread = Thread()
    thread.createThread('TH001','Matematika','1 + 1 = ','Bill')
    thread.replyThread('2')
    thread.removeThread()

    # Post
    post = Post()
    post.writePost("Post baru")
    post.seePost()
    post.deletePost()

