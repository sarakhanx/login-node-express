const DocsBlogs = require('../models/docs-blog/docsblogs.model')
const db =require('../models');
const User = db.user;
const slugify = require("slugify")
const { v4: uuidv4 } = require('uuid');

exports.docsblogcreate = async (req , res ) => {
    const {docsTitle , docsContent } = req.body
    let slug = slugify(docsTitle);
    if (!slug) slug = uuidv4
    try {
        //? validation สำหรับ create blog นี้
        switch(true){
            case !docsTitle:
                return res.status(400).json({error:"Empty title fill"})
                break;
            case !docsContent:
                return res.status(400).json({error:"empty content fill"})
                break;
        }

        //? เอามาเช็ค User
        const userId = req.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        //? เอามาไว้สร้าง creator === username ของคนที่ loged in
        const creator = user.username;

        //? ทั้งหมดผ่านแล้ว ให้สร้าง blog 
        const docsblog = await DocsBlogs.create({docsTitle,docsContent,creator,slug})
        res.status(200).json(docsblog)
    } catch (error) {
        res.status(500).send(error)
    }
}
 
exports.allDocsblogs =async (req , res)=>{
    try {
        const alldocsblog = await DocsBlogs.find()
        res.status(200).json(alldocsblog);
    } catch (err) {
        res.status(500).json(err)
        
    }
    
}


exports.singleDocsblogs = async (req , res , next ) =>{
    const {slug} = req.params
    try {
        const singledocsblogs = await DocsBlogs.findOne({slug})
        if(!singledocsblogs){
           return res.status(404).json({message : 'ERROR !! NOT FOUND CONTENT'})
        }
        next()
        res.json(singledocsblogs);
    
    } catch (err) {
        res.status(400).send({message :'an error ocurred in backend'})
    }
}