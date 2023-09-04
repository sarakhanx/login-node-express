const mongoose = require('mongoose')

const docsBlogs = mongoose.Schema({
    docsTitle : {
        type : String,
        require : true,    
    },
    docsContent : {
        type : {},
        require : true,
    },
    creator : {
        type : String,
        require : true
    },
    slug : {
        type : String,
        lowercase : true,
        unique : true,
    }
},
    {timestamps:true})
module.exports = mongoose.model("DocsBlogs", docsBlogs)