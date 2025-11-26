import * as adminreader from "../models/AdminReadermodel.js";

export const Getall = async (req, res) => {
  try {
    const users = await adminreader.getuser();
    res.status(200).json({ success: true, message: users });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const Register = async (req, res) => {
    const { username, password } = req.body;
    try {
        const userId = await adminreader.createUser(username, password);
        res.status(200).json({success: true, message: userId}); 
    } catch (e) {
        console.log(e);
        res.status(500).json({success: false, message: "Internal Server Error"})
    }
}

export const userLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const data = await adminreader.login(username, password);
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
