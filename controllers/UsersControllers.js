import * as userModel from "../models/Users.js";


export const fetchuser = async (req, res) => {
    try {
        const users = await userModel.getuser();
        res.status(200).json({success: true, message: users});
    } catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}   

export const Register = async (req, res) => {
    const { username, password, name } = req.body;
    try {
        const userId = await userModel.createUser(username, password, name);
        res.status(200).json({success: true, message: userId}); 
    } catch (e) {
        console.log(e);
        res.status(500).json({success: false, message: "Internal Server Error"})
    }
}

export const userLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const data = await userModel.login(username, password);
        res.status(200).json({
            success: true,
            token: data.token,
            role: data.role,
            name: data.name,
            id: data.id
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: e.message });
    }
}


export const removeUser= async (req, res) => {
    const {id} = req.params;
    try {
        const deletedId = await userModel.removeUser(id);
        res.status(200).json({success: true, message: deletedId});
    } catch (e) {
        console.log(e);
        res.status(500).json({success: false, message: "Internal Server Error"})
    }
}

// export const updateuser = async (req, res) => {
//     const {username, password} = req.body;
//     const {id} = req.params
//     try {
//         const updatedId = await userModel.updateuser(username, password, id);
//         res.status(200).json({success: true, message: id});
// }catch (e) {
//         console.log(e);
//         res.status(500).json({success: false, message: "Internal Server Error"})
//     }
// }


