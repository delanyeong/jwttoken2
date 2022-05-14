require("dotenv").config();

const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const users = require ("./users")
const transactions = require ('./transactions')
const PORT = process.env.PORT ?? 5000

app.use(express.json());
app.use(express.static('public'))

app.get("/", (req,res) => {
    res.send('working')
})

const verifyToken = (req, res, next) => {
    try {
      const authToken = req.headers.token;
  
      // validate the token
      const decoded = jwt.verify(authToken, process.env.TOKEN_SECRET);
  
      // if valid, retrieve the username from the token
      const username = decoded.data;
  
      req.user = username;
  
      next();
    } catch (error) {
      res.sendStatus(403);
    }
  };

app.post("/login", (req,res) => {
    const {username, password } = req.body
      
        if (users[username].password === password) {
          //authenticate and create the jwt
      
          const newToken = jwt.sign(
            {
              data: username, //line 46 need to match with this which is data
            },
            process.env.TOKEN_SECRET,
            { expiresIn: 60 * 60 }
          );

        res
        .status(200)
        .cookie("NewCookie", newToken, { path: "/" , httpOnly: true })
        .send("cookie");

        // res.status(200).json({ token: newToken });
      } else {
        res.status(403).send("unauthorised");
      }
    });

    app.post("/posts", verifyToken, (req, res) => {
        const username = req.user;
        const userTransactions = transactions[username];
        res.status(200).json({ transactions: userTransactions });
      });

      app.post("/logout", (req,res) => {
          res.clearCookie("NewCookie").send("cookie dead")
      })

    // app.post("/posts", (req,res) => {
    // try{
    //     //take token from the body
    //     console.log(req.headers)
    //     const authToken = req.headers.token;

    //     //validate the token
    //     const decoded = jwt.verify(authToken, process.env.TOKEN_SECRET)
    //     // res.json({ username: decoded.data }) //user

    //     //if invalid, you should send back a 403
    //     if (!decoded) {
    //         res.status(403).end
    //     }

    //     //if valid, retrieve the username from the token
    //     const username = decoded.data //need to match with line 23

    //     const userTransactions = transactions[username]

    //     res.status(200).json ({ transactions: userTransactions })
    // } catch (error) {
    //     res.sendStatus(403);
    // }
    // });

app.listen(3000, ()=>{ console.log('listening at port 3000')})