const express = require("express");
const { protect } = require("../middleware/authmiddleware")
const { accessChat, getChat, createGroupChat, reNameGroup, addToGroup, removeFromGroup } = require('../controlers/chatControlers')

const router = express.Router();

router.route('/').post(protect, accessChat);
router.route('/').get(protect, getChat);
router.route('/group').post(protect, createGroupChat);
router.route('/rename').put(protect, reNameGroup);
router.route('/groupadd').put(protect, addToGroup);
router.route('/groupremove').put(protect, removeFromGroup);


module.exports =  router;
