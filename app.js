require("dotenv").config();

const express = require("express");
const movieHandlers = require("./movieHandlers.js");
const userHandlers = require("./userHandlers.js");
const { hashPassword, verifyPassword, verifyToken } = require("./auth.js");

const app = express();

app.use(express.json());

const port = process.env.APP_PORT ?? 5000;

const welcome = (req, res) => {
  res.send("I am a English man");
};


app.get("/", welcome);

/* ------------------------------ PUBLIC ROUTE --------------------------------- */
// --------------------- MOVIES -------------------- 

app.get("/api/movies", movieHandlers.getMovies);
app.get("/api/movies/:id", movieHandlers.getMovieById);

app.post("/api/movies", verifyToken,movieHandlers.postMovie);

// --------------------- USERS -------------------- 

app.get("/api/users", userHandlers.getUsers);
app.get("/api/users/:id", userHandlers.getUserById);

app.post("/api/users", hashPassword, userHandlers.postUser);

// --------------------- LOGIN -------------------- 

app.post("/api/login", userHandlers.getUserByEmailWithPasswordAndPassToNext, verifyPassword);

/* -------------------------------  PROTECT ROUTE -------------------------------- */

app.use(verifyToken);

app.put("/api/movies/:id", movieHandlers.updateMovie);
app.delete("/api/movies/:id", movieHandlers.deleteMovie);


app.put("/api/users/:id", (req, res, next) => {
  if (req.body.password) {
    hashPassword(req, res, next);
  } else {
    next();
  }
}, userHandlers.updateUser);


app.delete("/api/users/:id", userHandlers.deleteUser);


app.listen(port, (err) => {
  if (err) {
    console.error("Something bad happened");
  } else {
    console.log(`Server is listening on ${port}`);
  }
});
