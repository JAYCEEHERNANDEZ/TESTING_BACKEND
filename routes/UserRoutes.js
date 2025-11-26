import * as user from "../controllers/UsersControllers.js";
import express from "express";
//import authHandler from "../middleware/authHandler.js";

const userRoutes = express.Router();

//userRoutes.use(authHandler)
userRoutes.get('/all', user.fetchuser);

userRoutes.post('/register', user.Register);

userRoutes.post('/login', user.userLogin);

userRoutes.delete('/delete/:id', user.removeUser);

// userRoutes.put('/update/:id', user.updateuser);


export default userRoutes;