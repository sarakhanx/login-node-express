const {authJwt} = require('../middlewares');
const controller = require('../controllers/user.controller')

module.exports = function(app){
    app.use(function(req , res , next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });
    app.get('/api/test/all',controller.allAccess)

    app.get('/api/user',[authJwt.validationToken],controller.userBoard);
    app.get('/api/auth/moderator',[authJwt.validationToken],controller.moderatorBoard);
    app.get('/api/auth/axemin',[authJwt.validationToken],controller.adminBoard);
};