const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Chat = require("../models/chatModels");

//ctrl for create chat
const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if(!userId){
        console.log("userid parms not sent to request");
        return res.sendStatus(400);
    }

    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id }}},
            { users: { $elemMatch: { $eq: userId }}},
        ]
    }).populate("users", "-password").populate("latestMessage");
    

    isChat = await User.populate(isChat, {
        path:'latestMessage.sender',
        select: "name pic email",
    });

    if(isChat.length > 0) {
        res.send(isChat[0]);
    }
    else{
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        };

        try{
            const createdChat = await Chat.create(chatData);

            const FullChat = await Chat.findOne({ _id:createdChat._id}).populate(
                "users",
                "-password"
            );

            res.status(200).send(FullChat)

        }
        catch(error){
            res.status(400);
            throw new Error(error.message);

        }
    }
});

//ctrl for get chat
const getChat = asyncHandler(async (req, res) => {
    // console.log('res.user:', req.user);
    try {
      Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 })
        .then(async (results) => {
          results = await User.populate(results, {
            path: "latestMessage.sender",
            select: "name pic email",
          });
  
          res.status(200).send(results);
        });
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  });

  //ctrl for crate group chat
  const createGroupChat = asyncHandler(async(req, res) => {

    if(!req.body.users || !req.body.name){
        returnres.status(400).send({message: "please fill the all fields"});
    }
    var users =  JSON.parse(req.body.users);

    if(users.length > 2){
        return res
        .status(400)
        .send("mpore then 2 users are required to form a group chat");
    }

    users.push(req.user);

    try{

        const groupChat =  await Chat.create({
            chatName:req.body.name,
            users:users,
            isGroupChat:true,
            groupAdmin: req.user,
        });

        const fullGroupChat = await Chat.findOne({
            _id:groupChat._id
        })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")

       res.status(200).json(fullGroupChat);
    }
    catch(error){
        res.status(400);
        throw new Error(error.message)


    }

  })

  //ctrl for rename group
  const reNameGroup = asyncHandler(async(req, res) =>{
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName,
        },
        {
            new:true,
        }
    )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

    if(!updatedChat){
       res.status(400);
       throw new Error("Chat Not Found");
    } else {
       res.json(updatedChat);
    }
  });

//ctrl add to group
const addToGroup = asyncHandler(async(req, res) =>{

    const {chatId, userId } = req.body;

    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push:{users: userId},
        },
        
        { new: true }
    )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");  
    
    if(!added){
        res.status(404);
        throw new Error("Chat not Found");
    }else{
       res.json(added);
    }

});

//ctrl remove form group
const removeFromGroup = asyncHandler(async(req, res) =>{

    const {chatId, userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull:{users: userId},
        },
        
        { new: true }
    )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");  
    
    if(!removed){
        res.status(404);
        throw new Error("Chat not Found");
    }else{
       res.json(removed);
    }

});



module.exports = { accessChat, getChat,createGroupChat, reNameGroup, addToGroup, removeFromGroup };