const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const db = require("./app/models/index");
const Role = db.role;
const dbConfig = require("./app/configs/db.config");
const morgan = require("morgan");
require("dotenv").config();


const app = express();

//*<< # DATABASE START HERE >>*//

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("database connected !!!");
    initial();
  })
  .catch((err) => {
    console.error(`can not connect to database status ${err}`, err);
    process.exit();
  });

//? function นี้เอาไว้ check ว่ามี Role อยู่ใน db หรือป่าว ถ้าไม่มี ให้สร้าง collection role ขึ้นมา //
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

//*<< #MIDDLEWARE START HERE >>*//
const corsOptions = {
  //? ทำไว้เพื่อ setting cors และนำไปใช้ใน cors ได้ง่ายๆ แก้เรื่อง preflight ด้วย
  origin: "http://localhost:8081", //?เปบี่ยนเป็น port ที่เราใช้งาน
};
app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(express.json());

app.use(morgan('dev'));
// parse requests of content-type - application/x-www-form-urlencoded
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  cookieSession({
    name: "userssession",
    keys: ["behemothproject"],
    httpOnly: true,
  })
);

//*<< #ROUTES START HERE >>*//
app.get("/", (req, res) => {
  res.json({ message: "hi it's first sound from behemoth" });
});
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/docsblogs.routes')(app);



// //? --------------
// const test = (req,res)=>{
//   res.status(200).send({message:'Hiii'})
// }
// app.get('/test/test',test)
// //? --------------

//*<< #SERVER START HERE >>*//
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`server is running in port ${port}`);
});
