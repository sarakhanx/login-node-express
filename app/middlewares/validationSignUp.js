const db = require('../models');
const ROLES = db.ROLES;
const User = db.user;

//* Validate Function *//

checkDuplicateUser = async (req, res, next) => {
    try {
      const existingUsernameUser = await User.findOne({ username: req.body.username });
      if (existingUsernameUser) {
        return res.status(400).send({ message: 'Username is already in use!' });
      }
  
      const existingEmailUser = await User.findOne({ email: req.body.email });
      if (existingEmailUser) {
        return res.status(400).send({ message: 'Email is already in use!' });
      }
  
      next();
    } catch (error) {
      res.status(500).send({ message: 'An error occurred!', error });
    }
  };


checkRoleExisted =(req,res,next)=>{
    if(req.body.roles) {
        for (let i = 0; i<req.body.roles.length; i++){
            if(!ROLES.includes(req.body.roles[i])) {
                res.status(400).send({message:`failed Roles ${req.body.roles[i]} doesn't exist !`})
                return;
            }
        }
    }
    next();
}

const validationSignUp = {
    checkDuplicateUser,checkRoleExisted
};
module.exports = validationSignUp;
