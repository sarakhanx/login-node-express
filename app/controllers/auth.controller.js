const config = require('../configs/auth.config')
const db = require('../models')
const User = db.user;
const Role = db.role;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { expressjwt } = require('express-jwt');

//? function สำหรับ สมัครสมาชิก

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
            await user.save();
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

// exports.signup =async (req,res) => {
//     const user = new User({
//         username:req.body.username,
//         email:req.body.email,
//         password:bcrypt.hashSync(req.body.password,8)
//     });
//     await user.save((err,user)=>{
//         if(err){
//             res.status(500).send({message:'an error in save user is process ',err});
//             return ;
//         }
//         if(req.body.roles) {
//             Role.find({
//                 name:{$in: req.body.roles},
//             },
//             (err,roles)=>{
//                 if(err){
//                     res.status(500).send({message:'an error in request ',err})
//                     return;
//                 }
//                 user.roles = roles.map((role)=>role._id);
//                 user.save((err)=>{
//                     if(err){
//                         res.status(500).send({message:err});
//                         return;
//                     }
//                     res.send({message:'user was register succesfully !!'});
//                 });
//             })
//         } else {
//             Role.findOne({name:'user'},(err , role)=>{
//                 if(err){
//                     res.status(500).send({message:err});
//                     return ;

//                 }
//                 user.roles = [role._id];
//                 user.save((err)=>{
//                     if(err){
//                         res.status(500),send({message:err});
//                         return;
//                     }
//                     res.send({message:'user was register succesfully !!'});
//                 })
//             })
//         }
//     })
// };

exports.signin = async(req , res , next) => {
    try{
        const user = await User.findOne({username: req.body.username})
        .populate("roles","-__v");
        if(!user){
            res.status(404).send({message:'user not found !'});
            next();
        }
        const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send({message:'password is not correct !'})
        }
        const token = jwt.sign({id:user.id},config.secret,{
            algorithm:'HS256',
            allowInsecureKeySizes:true,
            expiresIn:'1d'
        });

        const  authorities = user.roles.map(role => "ROLE_"+role.name.toUpperCase());

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

// exports.signin = (req , res)=>{
//     User.findOne({
//         username:req.body.username,
//     }).populate("roles","-__v").exec((err , user)=>{
//         if(err){
//             res.status(500).send({message:err});
//             return;
//         }
//         if(!user){
//             return res.status(404).send({message:'user not found !'});

//         }
//         const passwordIsValid = bcrypt.compareSync(req.body.password , user.password);
//         if(!passwordIsValid) {
//             return res.status(401).send({message:'invalid password! please try again'});
//         }
//         const token = jwt.sign({id:user.id},config.secret,{
//             algorithm: 'HS256',
//             allowInsecureKeySizes:true,
//             expiresIn: '1d'
//         });
//     const authorities = [];
//     for(let i=0; i < user.roles.lenght; i++){
//         authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
//     }
//     req.session.token = token;
//     res.status(200).send({
//         id: user._id,
//         username: user.username,
//         eamil: user.email,
//         roles:authorities,
//     });
//     })
// }

exports.signout = async(req , res )=>{
    try {
        req.session = null;
        return res.status(200).send({message:'BON VOYAGES ! เราจะคิดถึงนาย'})
    } catch (err) {
            this.next(err)
    }
};

// exports.requirelogin = expressjwt({
//     secret : config.secret,
//     algorithms : ["HS256"],
//     userProperty : "auth"
// })
