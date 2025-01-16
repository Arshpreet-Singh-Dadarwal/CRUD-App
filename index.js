require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 4000;

// Database connection
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to database"))
    .catch((error) => console.error("Database connection error:", error));

const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Database connection is live!"));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Session middleware
app.use(session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: false,
}));

// Flash message middleware
app.use((req, res, next) => {
    res.locals.message = req.session.message || null;
    delete req.session.message;
    next();
});

// Serve static files
app.use("/uploads", express.static("uploads"));


// Set EJS as the view engine
app.set("view engine", "ejs");

// Import and use routes
const routes = require("./routes/routes");
app.use("", routes);

// Start server
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
