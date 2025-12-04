    import * as user from "../controllers/UsersControllers.js";
    import express from "express";

    const userRoutes = express.Router();

    userRoutes.get('/all', user.fetchuser);
    userRoutes.post('/register', user.Register);
    userRoutes.post('/login', user.userLogin);
    // userRoutes.delete('/delete/:id', user.removeUser);

        // Deactivate account instead of delete
    userRoutes.put('/deactivate/:id', user.deactivateAccount);

    // Reactivate account (optional)
    userRoutes.put('/reactivate/:id', user.reactivateAccount);

    userRoutes.post("/reset-password/:id", user.resetPassword);

    export default userRoutes;
