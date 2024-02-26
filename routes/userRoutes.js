const express = require('express');
const { registerUser, authUser, allUsers } = require("../controlers/userControler");
const { protect } = require("../middleware/authmiddleware")

const router = express.Router();

router.route('/').post(registerUser).get(protect, allUsers);

router.post('/login', authUser)

// router.route('/').get(protect, allUsers);


module.exports = router;

