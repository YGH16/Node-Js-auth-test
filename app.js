require("dotenv").config();
require("./config/database").connect();
const express = require("express");

// Mongoose models
const User = require("./model/user");

// custom middleware
const auth = require("./middleware/auth");

const app = express();
app.use(express.json());

// Register
app.post("/register", (req, res) => {
    try {
        // destructure user input
        const { first_name, last_name, email, password } = req.body;
    
        // ensure all fields are required
        if (!(email && password && first_name && last_name)) {
          res.status(400).send("All input is required");
        }
    
        // check if user exists
        const oldUser = await User.findOne({ email });
    
        if (oldUser) {
          return res.status(409).send("User Exists, Please Login");
        }
    
        //Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10);
    
        // Create user in our database
        const user = await User.create({
          first_name,
          last_name,
          email: email.toLowerCase(), // sanitize: convert email to lowercase
          password: encryptedPassword,
        });
    
        res.status(200).json("User account successfully created");
    
    } catch (err) {
        // Log error to console
        console.log(err);
        res.status(500).json("Something went wrong")
    }
});

// Login  route - generate token
app.post("/login", (req, res) => {
    try {
        // destructure user input
        const { email, password } = req.body;
    
        // check all fields are correctly entered
        if (!(email && password)) {
          res.status(400).send("required fields don't exist");
        }

        // Check if user exists in the database
        const user = await User.findOne({ email });
    
        if (user && (await bcrypt.compare(password, user.password))) {
          // Create the JWT token
          const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );
    
        //   Return the token to user
          res.status(200).json(token);
        }

        res.status(400).send("Invalid Credentials");

    } catch (err) {
        console.log(err);
    }
});

app.post("/protected", auth, (req, res) => {
    res.status(200).json("You are in a protected route");
  });



module.exports = app;