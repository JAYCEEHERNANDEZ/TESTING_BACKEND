    import * as user from "../controllers/UsersControllers.js";
    import express from "express";

    const userRoutes = express.Router();

    userRoutes.get('/all', user.fetchuser);
    userRoutes.post('/register', user.Register);
    userRoutes.post('/login', user.userLogin);
    userRoutes.get("/:id", user.getUserById);
   
    // Deactivate account instead of delete
    userRoutes.put('/deactivate/:id', user.deactivateAccount);

    // Reactivate account (optional)
    userRoutes.put('/reactivate/:id', user.reactivateAccount);

    // Reset password
    userRoutes.post("/reset-password/:id", user.resetPassword);

     // userRoutes.delete('/delete/:id', user.removeUser);

    export default userRoutes;
