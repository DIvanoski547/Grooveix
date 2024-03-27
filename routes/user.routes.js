//import dependencies
const router = require("express").Router();
const mongoose = require("mongoose");
//import data models
const Album = require("../models/Album.model");
const User = require("../models/User.model");
//import middleware
const { isAuthenticated, isAdmin } = require("../middleware/jwt.middleware");
//import cloudinary configuration
const fileUploader = require("../config/cloudinary.config");

//POST route for uploading profile image and get back url (file path)
router.post(
  "/profile/image-upload",
  fileUploader.single("profileImage"),
  (req, res, next) => {
    if (!req.file) {
      next(new Error("No file uploaded!"));
      return;
    }
    res.json({ profileImage: req.file.path });
  }
);

//GET Route /users -> ADMIN -> display all the users from database
router.get("/users", isAuthenticated, isAdmin, (req, res, next) => {
  User.find()
    .then((allUsers) => {
      res.json(allUsers);
    })
    .catch((err) => {
      console.log("error while getting all users", err);
      res.status(500).json({ message: "Error while getting all users" });
    });
});

//POST Route /api/users -> JSON -> ADMIN -> send data to add a new user in the database
// router.post("/users", isAuthenticated, isAdmin, (req, res, next) => {
//   const { firstName, lastName, username, email, password } = req.body;

//   User.create({ firstName, lastName, username, email, password })
//     .then((response) => res.json(response))
//     .catch((err) => {
//       console.log("error while creating user", err);
//       res.status(500).json({ message: "error while creating user" });
//     });
// }); gotta discuss this with David since passwords will never be hashed


//GET Route /users/:userId ---> none ---> displays specific user info profile by id ---> you must be the admin user
router.get("/:userId", isAuthenticated, isAdmin, (req, res, next) => {
  const { userId } = req.params;

  User.findById(userId);
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  User.findById(userId)
    .then((oneUser) => res.status(200).json(oneUser))
    .catch((err) => {
      console.log("error while retrieving user", err);
      res.status(500).json({ message: "Error while retrieving user" });
    });
});

//PUT Route /users/:userId -> JSON -> ADMIN -> update specific user’s information
router.put("/:userId", isAuthenticated, isAdmin, (req, res, next) => {
  const { userId } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     res.status(400).json({ message: "Specified id is not valid" });
//     return;
//   }

//   User.findByIdAndUpdate(userId, req.body, { new: true })
//     .then((updatedUser) => res.json(updatedUser))
//     .catch((err) => {
//       console.log("error while updating user", err);
//       res.status(500).json({ message: "error while updating user" });
//     });
// });

//GET Route /users/profile ---> none ---> display current user info
router.get("/profile", isAuthenticated, (req, res, next) => {
  console.log("payload", req.payload);

  User.findById(req.payload._id)
    .then((loggedUser) => res.status(200).json(loggedUser))
    .catch((err) => {
      console.log("error while retrieving user", err);
      res.status(500).json({ message: "error while retrieving user" });
    });
});

//PUT route to update user's information and add the new file as profile image
router.put("/profile", (req, res) => {

  console.log("req.body", req.body);
  const { _id, profileImage } = req.body;

  User.findByIdAndUpdate(_id, { profileImage }, { new: true })
    .then(
    (updatedUser) => {
      //deconstruct body
      const { _id, profileImage, firstName, lastName, username, email } =
        updatedUser;
      res
        .json({
          updatedUser: {
            _id,
            profileImage,
            firstName,
            lastName,
            username,
            email,
          },
        })
        
    }
  )
  .catch((err) => next(err));
});

module.exports = router;
