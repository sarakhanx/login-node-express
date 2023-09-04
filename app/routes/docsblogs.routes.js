const controller = require('../controllers/docsblog.controller')
const { authJwt} = require('../middlewares')

module.exports = function(app){
    app.use(function(req , res , next){
        res.header(
            "Access-Control-Allow-Headers",
            "Origin , Content-Type , Accept"
        )
        next();
    });
    app.post('/api/docsblog/blogcrerate',[authJwt.validationToken],controller.docsblogcreate)
    app.get('/api/docsblog/alldocs',controller.allDocsblogs)
    app.get('/api/docsblog/alldocs/:slug' , controller.singleDocsblogs)
}