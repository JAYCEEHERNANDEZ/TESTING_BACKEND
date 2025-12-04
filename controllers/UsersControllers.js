import * as userModel from "../models/Users.js";
import { updateUserPassword } from "../models/Users.js";
import bcrypt from 'bcryptjs';


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

// Deactivate account
export const deactivateAccount = async (req, res) => {
    const { id } = req.params;
    try {
        const affectedRows = await userModel.deactivateUser(id);
        if (affectedRows === 0) throw new Error("User not found or already deactivated");
        res.status(200).json({ success: true, message: `User ${id} deactivated` });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: e.message });
    }
};

// Reactivate account (optional)
export const reactivateAccount = async (req, res) => {
    const { id } = req.params;
    try {
        const affectedRows = await userModel.reactivateUser(id);
        if (affectedRows === 0) throw new Error("User not found or already active");
        res.status(200).json({ success: true, message: `User ${id} reactivated` });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: e.message });
    }
};

export const resetPassword = async (req, res) => {
  const userId = req.params.id;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "Password cannot be empty" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(userId, hashedPassword);

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update password", error: err });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userModel.getUser(id);
    res.status(200).json({ data: user });
  } catch (err) {
    console.error("Error fetching user:", err);
    if (err.message === "User not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// export const removeUser= async (req, res) => {
//     const {id} = req.params;
//     try {
//         const deletedId = await userModel.removeUser(id);
//         res.status(200).json({success: true, message: deletedId});
//     } catch (e) {
//         console.log(e);
//         res.status(500).json({success: false, message: "Internal Server Error"})
//     }
// }

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


