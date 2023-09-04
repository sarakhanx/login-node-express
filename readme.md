  # //* สิ่งที่ต้องเตรียมก่อน npm init//
  # todo: npm install express mongoose cors cookie-session jsonwebtoken bcryptjs nodemon dotenv --save

  # //* เริ่มกันเล้ยยย ขั้นตอนแรก ให้เริ่มจากสร้าง server ก่อนเลย

  --server.--
  -----
  const express = require('express')
  const cors = require('cors');
  const cookieSession = require('cookie-session')
  require("dotenv").config()

  const app = express();
  -----



  # MIDDLEWARE START HERE
  const corsOptions = {
    //*ทำไว้เพื่อ setting cors และนำไปใช้ใน cors ได้ง่ายๆ แก้เรื่อง preflight ด้วย
    origin: 'http://localhost:8081',

  };
  app.use(cors(corsOptions));
  // parse requests of content-type - application/json
  app.use(express.json());
  // parse requests of content-type - application/x-www-form-urlencoded
  app.use(express.urlencoded({
    extended:true
  }));
  app.use(cookieSession({
    name: "userssession",
    keys: ['behemothproject'],
    httpOnly: true
  }));

  //*<< #ROUTES START HERE >>*//
  app.get('/',(req,res)=>{
    res.json({message:"hi it's first sound from behemoth"})
  });


  //*<< #SERVER START HERE >>*//
  const port = process.env.PORT || 8080
  app.listen(port,()=>{
    console.log(`server is running in port ${port}`)
  })





  // // set port, listen for requests
  // const PORT = process.env.PORT || 8080;
  // app.listen(PORT, () => {
  //   console.log(`Server is running on port ${PORT}.`);
  // });
  -----
  # เราจะมาทดลอง server เราก่อน โดย request API ที่ http://localhost:5500/
    โดยเราจะได้ข้อความ *hi it's first sound from behemoth* ออกมานั่นเอง

  -----
  # ขั้นตอนต่อมา จะมาเริ่มเชื่อมต่อฐานข้อมูลกัน อ่ะ ไปกัน !
  #  1.) เริ่มจากสร้าง './configs/db.config.js'
  --db.config.js
  -----
  module.exports ={
    HOST: '0.0.0.0',
    PORT : 27017 ,
    DB : 'behemoth'
  };
  -----
  # เราจะมาเริ่มสร้าง models กัน
  # เริ่มจากสร้างไฟล์ขึ้นมา 2 ไฟล์ ชื่อว่า role.model.js , user.model.js
  # โดยภายใน file ที่สร้างขึ้นมาใหม่นั้นกำหนดลักษณะนี้ครับ

  --role.model.js
  -----
  const mongoose = require("mongoose");
  const Role = mongoose.model(
  "Role",
  new mongoose.Schema({
    name:String,
  })
  );
  module.exports = Role;
  -----
  --user.model.js
  -----
  const mongoose = require("mongoose");
  const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }]
  })
  );
  module.exports = User;
  -----
  # จากนั้นเราจะมาทำการเชื่อมต่อ server ด้วยการเริ่มจากสร้าง file './app/models/index.js'
  --index.js
  -----
  const mongoose = require('mongoose');

  mongoose.Promise = global.Promise;
  const db = {};
  db.mongoose = mongoose;
  db.user = require("./user.model");
  db.role = require('./role.model');
  db.ROLES = ["user" , "admin" , "moderator"];

  module.exports = db;
  -----
  # กลับมาที่ './server/js' และเริ่มเพิ่ม code ลงไป
  -----
  const db = require("./app/models");
  const Role = db.role; <--- ไปเอา block role ใน file ./app/models/index.js มา//
  .
  .
  //* ส่วนนี้คือส่วน connect*//
  db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial(); <----- ฟังค์ชั่นตรงนี้เราจะไปสร้างในขั้นตอนต่อไป
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });
  .
  .
  async function initial() {
  try {
    const count = await Role.estimatedDocumentCount();

    if (count === 0) {
      await Promise.all([
        new Role({
          name: "user",
        }).save(),
        new Role({
          name: "moderator",
        }).save(),
        new Role({
          name: "admin",
        }).save(),
      ]);

      console.log("Roles have been created in the collection");
    }
  } catch (error) {
    console.error("An unknown error occurred", error);
  }
  }
  -----
  # มา จะอธิบายสักเล็กน้อยเกี่ยวกับ initial(); ที่ implement มา คือมันทำงานกับ .estimatedDocumentCount เป็น method
  # เอาไว้นับว่ามี (collection จาก mongo).estimatedDocumentCount() === 0 หรือป่าว ถ้า true ก็ให้ไปสร้าง new Role user,mod,admin มา กล่าวก็คือ ถ้าค่า = 0 ให้ไปสร้าง collection ใน db มาตามที่กำหนดซะ ซึ่งในที่นี้ผมกำหนดไว้ 3 Role และ 3 Role นี้ relate กับ userSchema ก็คือตรงนี้
  /*****************************************
  *               ROLES: [{               *
  * TYPE: MONGOOSE.SCHEMA.TYPES.OBJECTID, *
  *              REF: "ROLE"              *
  *                  }]                   *
  *****************************************/

  # ขั้นตอนนี้ง่ายหน่อยคือเราจะสร้าง Secret Key ให้ JWT กัน ให้สร้าง './app/configs/auth.config.js'
  --auth.config.js
  -----
  module.exports = {
  secret: "bezkoder-secret-key"
  };
  -----


  # ขั้นตอนต่อมา เราจะมาสร้าง middldeware เพื่อเอาไว้ validations การ signUp user โดยเริ่มจาก สร้าง ./app/middlewares/validationSignUp.js
  --validationSignUp.js
  -----
  const db = require("../models");
  const ROLES = db.ROLES;
  const User = db.user;

  checkDuplicateUsernameOrEmail = (req, res, next) => {
  // Username
  User.findOne({
    username: req.body.username
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (user) {
      res.status(400).send({ message: "Failed! Username is already in use!" });
      return;
    }

    // Email
    User.findOne({
      email: req.body.email
    }).exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (user) {
        res.status(400).send({ message: "Failed! Email is already in use!" });
        return;
      }

      next();
    });
  });
  };

  checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: `Failed! Role ${req.body.roles[i]} does not exist!`
        });
        return;
      }
    }
  }

  next();
  };

  const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted
  };

  module.exports = verifySignUp;
  -----

  # ขั้นตอนต่อมา จะมาสร้าง middleware ในส่วนของ auth โดยเริ่มจากสร้าง './app/middlewares/authJwt.js'
  --authJwt.js
  -----
  const jwt = require("jsonwebtoken");
  const config = require("../config/auth.config.js");
  const db = require("../models");
  const User = db.user;
  const Role = db.role;

  verifyToken = (req, res, next) => {
  let token = req.session.token;

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token,
            config.secret,
            (err, decoded) => {
              if (err) {
                return res.status(401).send({
                  message: "Unauthorized!",
                });
              }
              req.userId = decoded.id;
              next();
            });
  };

  isAdmin = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.find(
      {
        _id: { $in: user.roles },
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "admin") {
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require Admin Role!" });
        return;
      }
    );
  });
  };

  isModerator = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.find(
      {
        _id: { $in: user.roles },
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "moderator") {
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require Moderator Role!" });
        return;
      }
    );
  });
  };

  const authJwt = {
  verifyToken,
  isAdmin,
  isModerator,
  };
  module.exports = authJwt;
  -----

  # ขั้นตอนนี้สร้าง './app/middlewares/index.js' ขึ้นมา
  --index.js
  -----
  const authJwt = require("./authJwt");
  const verifySignUp = require("./verifySignUp");

  module.exports = {
  authJwt,
  verifySignUp
  };
  -----
  # เรามาเริ่มทำ Controllers กันเต๊อะะะ เริ่มจาก สร้าง './app/controllers/auth.controller.js'
  --auth.controller.js
  -----
  const config = require("../config/auth.config");
  const db = require("../models");
  const User = db.user;
  const Role = db.role;

  var jwt = require("jsonwebtoken");
  var bcrypt = require("bcryptjs");

  exports.signup = (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles },
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = roles.map((role) => role._id);
          user.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.send({ message: "User was registered successfully!" });
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
  };

  exports.signin = (req, res) => {
  User.findOne({
    username: req.body.username,
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({ message: "Invalid Password!" });
      }

      const token = jwt.sign({ id: user.id },
                              config.secret,
                              {
                                algorithm: 'HS256',
                                allowInsecureKeySizes: true,
                                expiresIn: 86400, // 24 hours
                              });

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }

      req.session.token = token;

      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
      });
    });
  };

  exports.signout = async (req, res) => {
  try {
    req.session = null;
    return res.status(200).send({ message: "You've been signed out!" });
  } catch (err) {
    this.next(err);
  }
  };
  -----
  # ขั้นตอนนี้เราจะมาเริ่มสร้าง user controller โดยสร้าง './app/controllers/auth.controller.js' และ './app/controllers/user.controller.js'
  --auth/controller
  -----
  const config = require('../configs/auth.config')
  const db = require('../models')
  const User = db.user;
  const Role = db.role;
  const jwt = require('jsonwebtoken');
  const bcrypt = require('bcryptjs')

  //? function สำหรับ สมัครสมาชิก
  *** แก้ไขเพราะต้องใช้ try catch แทน ***
  exports.signup = async(req , res , next)=>{
    try {
        const user = new User({
            username:req.body.username,
            email:req.body.email,
            password:bcrypt.hashSync(req.body.password,8)
        });
        await user.save();
        if (req.body.roles) {
            const roles = await Role.find({ name: { $in: req.body.roles } });
            user.roles = roles.map(role => role._id);
          } else {
            const role = await Role.findOne({ name: 'user' });
            user.roles = [role._id];
          }
          res.send({ message: 'User was registered successfully!' });
        }catch (error) {
        if(error){
            res.status(500).send({message:"An error occurred while registering user.",error})
        }
    }
  }
  
  <!-- exports.signup = (req,res) => {
    const user = new User({
        username:req.body.username,
        email:req.body.email,
        password:bcrypt.hashSync(req.body.password,8)
    });
    user.save((err,user)=>{
        if(err){
            res.status(500).send({message:'an error in save user is process ',err});
            return ;
        }
        if(req.body.roles) {
            Role.find({
                name:{$in: req.body.roles},
            },
            (err,roles)=>{
                if(err){
                    res.status(500).send({message:'an error in request ',err})
                    return;
                }
                user.roles = roles.map((role)=>role._id);
                user.save((err)=>{
                    if(err){
                        res.status(500).send({message:err});
                        return;
                    }
                    res.send({message:'user was register succesfully !!'});
                });
            })
        } else {
            Role.findOne({name:'user'},(err , role)=>{
                if(err){
                    res.status(500).send({message:err});
                    return ;

                }
                user.roles = [role._id];
                user.save((err)=>{
                    if(err){
                        res.status(500),send({message:err});
                        return;
                    }
                    res.send({message:'user was register succesfully !!'});
                })
            })
        }
    })
  }; -->
*** แก้ไขเพราะต้องใช้ try catch แทน ***  
  
*** แก้ไขเพราะต้องใช้ try catch แทน ***
  exports.signin = async(req , res , next) => {
    try{
        const user = await User.findOne({username: req.body.username})
        .populate("roles","__v");
        if(!user){
            res.status(404).send({message:'user not found !'});
            next();
        }
        const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send({message:'password is not correct !'})
            next();
        }
        const token = jwt.sign({id:user.id},config.secret,{
            algorithm:'HS256',
            allowInsecureKeySizes:true,
            expiresIn:'1d'
        });

        const authorities = user.roles.map(role => "ROLE_"+role.name.toUpperCase());

        req.session.token = token;
        res.status(200).send({
            id : user._id,
            username : user.username,
            email : user.email,
            roles:authorities,
        });

    }catch(err){
        res.status(500).send({message:'An error occured while login .',err})
    }
  }

  <!-- exports.sigin = (req , res)=>{
    User.findOne({
        username:req.body.username,
    }).populate("roles","-__v").exec((err , user)=>{
        if(err){
            res.status(500).send({message:err});
            return;
        }
        if(!user){
            return res.status(404).send({message:'user not found !'});

        }
        const passwordIsValid = bcrypt.compareSync(req.body.password , user.password);
        if(!passwordIsValid) {
            return res.status(401).send({message:'invalid password! please try again'});
        }
        const token = jwt.sign({id:user.id},config.secret,{
            algorithm: 'HS256',
            allowInsecureKeySizes:true,
            expiresIn: '1d'
        });
    const authorities = [];
    for(let i=0; i < user.rolese.lenght; i++){
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
    }
    req.session.token = token;
    res.status(200).send({
        id: user._id,
        username: user.username,
        eamil: user.email,
        roles:authorities,
    });
    })
  } -->
  *** แก้ไขเพราะต้องใช้ try catch แทน ***

  exports.signout = async(req , res )=>{
    try {
        req.session = null;
        return res.status(200).send({message:'BON VOYAGES ! เราจะคิดถึงนาย'})
    } catch (err) {
            this.next(err)
    }
  };
  -----
  # และ
  # -- user.controller.js
  -----
  exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
  };

  exports.userBoard = (req, res) => {
    res.status(200).send("User Content.");
  };

  exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
  };

  exports.moderatorBoard = (req, res) => {
    res.status(200).send("Moderator Content.");
  };
  -----


  # ขั้นตอนนี้เราจะเริ่มสร้าง route สำหรับ auth หลังจากที่เราได้implement controller เสร็จแล้ว
  --auth.routes.js
  -----
  const { verifySignUp } = require("../middlewares");
  const controller = require("../controllers/auth.controller");

  module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted
    ],
    controller.signup
  );

  app.post("/api/auth/signin", controller.signin);

  app.post("/api/auth/signout", controller.signout);
  };
  -----

  # ขั้นตอนต่อมา เราจะกลับไปที่ ./server.js เพื่อเพิ่ม Route ลงไปในส่วน Middleware
  --server.js
  -----
  require('./app/routes/auth.routes')(app);
  require('./app/routes/user.routes')(app);
  -----

  # เสร็จแล้วววว ไปเทส API กันเถ๊อะะะะะ
  # โดย รายละเอียดมีดังนี้
  AUTH----การอนุญาต
  GET /api/test/all
  GET /api/test/user for loggedin users (user/moderator/admin)
  GET /api/test/mod for moderator
  GET /api/test/admin for admin

  AUTH----การรับรอง **
  POST /api/auth/signup
  POST /api/auth/signin
  POST /api/auth/signout

  docsCRUD-----
  POST /api/docsblog/blogcrerate = สร้างเอกสารลง Blog

