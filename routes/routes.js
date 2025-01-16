const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs=require('fs')

// Multer storage configuration
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

// Multer upload middleware
var upload = multer({
    storage: storage,
}).single("image");

// Add user route
router.post("/add", upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file ? req.file.filename : "", // Save uploaded image filename
        });

        await user.save();

        req.session.message = {
            type: "success",
            message: "User added successfully!",
        };

        res.redirect("/");
    } catch (err) {
        console.error("Error adding user:", err);
        req.session.message = {
            type: "danger",
            message: "Failed to add user!",
        };
        res.redirect("/add");
    }
});

// Home route
router.get("/", async (req, res) => {
    try {
        const users = await User.find(); // Use `await` instead of callbacks
        res.render("index", {
            title: "Home Page",
            users: users,
        });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Add user form route
router.get("/add", (req, res) => {
    res.render("add_users", { title: "Add Users" });
});

router.get("/edit/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            req.session.message = {
                type: "danger",
                message: "User not found!",
            };
            return res.redirect("/");
        }
        res.render("edit_users", {
            title: "Edit User",
            user: user,
        });
    } catch (err) {
        console.error("Error fetching user:", err);
        req.session.message = {
            type: "danger",
            message: "Failed to load user data!",
        };
        res.redirect("/");
    }
});

router.post("/update/:id", upload, async (req, res) => {
    const id = req.params.id;
    let new_image = "";

    if (req.file) {
        new_image = req.file.filename;
        const oldImagePath = "./uploads/" + req.body.old_image;
        if (fs.existsSync(oldImagePath)) {
            try {
                fs.unlinkSync(oldImagePath);
            } catch (err) {
                console.error("Error deleting old image:", err);
            }
        }
    } else {
        new_image = req.body.old_image;
    }

    try {
        await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        });

        req.session.message = {
            type: "success",
            message: "User updated successfully!",
        };
        res.redirect("/");
    } catch (err) {
        console.error("Error updating user:", err);
        req.session.message = {
            type: "danger",
            message: "Failed to update user!",
        };
        res.redirect(`/edit/${id}`);
    }
});


// Delete user route
router.get("/delete/:id", async (req, res) => {
    const id = req.params.id;

    try {
      
        const user = await User.findById(id);

        if (user) {

            const imagePath = "./uploads/" + user.image;
            if (fs.existsSync(imagePath)) {
                try {
                    fs.unlinkSync(imagePath);
                } catch (err) {
                    console.error("Error deleting image file:", err);
                }
            }

            // Delete the user from the database
            await User.findByIdAndDelete(id);

            req.session.message = {
                type: "success",
                message: "User deleted successfully!",
            };
        } else {
            req.session.message = {
                type: "danger",
                message: "User not found!",
            };
        }

        res.redirect("/");
    } catch (err) {
        console.error("Error deleting user:", err);
        req.session.message = {
            type: "danger",
            message: "Failed to delete user!",
        };
        res.redirect("/");
    }
});



module.exports = router;
