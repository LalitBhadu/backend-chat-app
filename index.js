const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const { chats } = require("./data/data")
const userRoutes = require("./routes/userRoutes")
const chatRoutes = require("./routes/chatRoutes")
const messageRoutes = require("./routes/messageRoutes")
const { notFound, errorHandler } = require("./middleware/errorMiddleware")
const { Socket } = require("socket.io")

const app = express()
require("dotenv").config()

app.use(express.json());
app.use(cors());

// CRUD //
app.get('/', (req, res) => {
    res.send("welcomew to our chat app apis")
});

app.use('/api/user', userRoutes)
app.use('/api/userchat', chatRoutes)
app.use('/api/message', messageRoutes)
app.use(notFound)
app.use(errorHandler)

// --------------------------deployment------------------------------

// const __dirname1 = path.resolve();

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname1, "/frontend/build")));

//   app.get("*", (req, res) =>
//     res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
//   );
// } else {
//   app.get("/", (req, res) => {
//     res.send("API is running..");
//   });
// }


// --------------------------deployment------------------------------


const port = process.env.PORT ||  8080;
const uri = process.env.ATLAS_URI;

app.get('/api/chat',(req, res)=>{
    res.send(chats);
})


app.get('/api/chat/:id',(req, res)=>{
    // console.log(req.params._id)
    const singleChat = chats.find((c)=> c._id === req.params.id);
    res.send(singleChat);
})

const server = app.listen(port, (req, res) =>{
    console.log(`server Run on port..: ${port}...`)
})

const io = require('socket.io')(server, {
    pingTimeOut:60000,
    cors:{
        origin: "http://localhost:3000",

    }
})


io.on("connection", (socket) => {
    console.log('connected to socket.io');

    socket.on('socket', (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on('join chat', (room) => {
        socket.join(room);
        console.log('user joind room' + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on('new essage', (newMessageRecived) => {
        var chat = newMessageRecived.chat;

        if (!chat.users) return console.log('chat.users not define');

        chat.users.forEach((user) => {
            if (user._id == newMessageRecived.sender._id) return;
      
            socket.in(user._id).emit("message recieved", newMessageRecived);
        });
    });

    socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });


});


mongoose.connect(uri, {
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then(()=>console.log("MongoDB Connection Estblised by Admin"))
.catch((error)=>console.log("MongoDB connection Faild:", error.message));

