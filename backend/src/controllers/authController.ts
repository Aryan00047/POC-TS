import {Request, Response} from "express";//you need to explicitly import Request and Response from Express when using TypeScript
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User, {IUser} from "../models/User"; // ./ current directory ../ move upto one directory
import nodemailer from "nodemailer";

export const register = async(req: Request, res: Response) : Promise<void> =>{//in ts this export method is preffered
try {
    const { name, email, password, role } = req.body;

    // Regular expressions for validation
    const nameRegex = /^[A-Za-z\s]+$/
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[_@#$]).{7,}$/;

    //validate name
    if(!name || !nameRegex.test(name)){
        res.status(400).json({message: "Name must contain only alphabets and spaces"});
        return;
    }
    // Validate email
    if (!email || !emailRegex.test(email)) {
        res.status(400).json({ message: "Invalid email format." });
        return;
    }

    // Validate password
    if (!password || !passwordRegex.test(password)) {
        res.status(400).json({
            message: "Password must be at least 7 characters, include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (_@#$)."
        });
        return;
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        
        res.status(400).json({ message: "User already exists" });
        return;
    }

    // Validate role
    const registeredRole = role.toUpperCase();
    const validRoles = ["ADMIN", "CANDIDATE", "HR"];
    if (!validRoles.includes(registeredRole)) {
        
       res.status(400).json({ message: "Role must be among CANDIDATE, HR, and ADMIN" });
       return;
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: registeredRole });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });

} catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server Error" });
}
}


export const login = async(req: Request, res: Response): Promise<void>=> {
    try {
        const {email, password, role} = req.body;

        const user = await User.findOne({email});

        if(!user){
            res.status(400).json({message: "User not found please register first"});
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            res.status(400).json({message: "Invalid Password..."});
            return;
        }

        const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET as string, {expiresIn: "1h"});
        //mongodb automatically creates _id field for every document
        res.json({
            message: "User logged in",
            token,
            userId: user._id,
            userRole: user.role});
    } catch (error) {
        res.status(500).json({message: "Server Error", error});
    }
}

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        // Check if the token exists in the request header
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "Unauthorized: No token provided" });
            return;
        }

        // Clear the token (if stored in cookies)
        res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "strict" });

        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found");
            res.status(400).json({ message: "User not found" });
            return;
        }

        // Generate a secure reset token (JWT + additional random string for security)
        const resetTokenPlain = crypto.randomBytes(32).toString("hex"); // Random string
        const resetToken = jwt.sign({ userId: user._id, token: resetTokenPlain }, process.env.JWT_SECRET as string, { expiresIn: "10m" });

        // Hash the token before storing it in the database
        user.resetToken = crypto.createHash("sha256").update(resetTokenPlain).digest("hex");
        user.resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration

        // Construct the password reset link
        const resetLink = `http://localhost:5173/reset-password/${resetTokenPlain}`; // Adjust frontend URL

        // Configure Nodemailer transport
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // Ensure you have an app password, not your Gmail password
            },
        });

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset Request",
            text: `Click the link below to reset your password:\n\n${resetLink}\n\nThis link is valid for 10 minutes.`,
        };

        // Send the email and save the token only if the email is sent successfully
        try {
            await transporter.sendMail(mailOptions);
            await user.save();
            console.log("Password reset link sent to email.");
            res.status(200).json({ message: "Password reset link sent to your email." });
        } catch (emailError) {
            console.error("Error sending email:", emailError);
            res.status(500).json({ message: "Failed to send reset email. Try again later." });
        }
    } catch (error) {
        console.error("Error in forgotPassword:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { resetToken } = req.params; // Received token from URL
    const { password } = req.body; // New password from user input

    try {
        console.log("Received resetToken:", resetToken);

        // Hash the received token (because we stored a hashed token in the DB)
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        // Find user by hashed token and check if it's still valid
        const user = await User.findOne({ resetToken: hashedToken, resetTokenExpires: { $gt: new Date() } });

        if (!user) {
            console.log("Invalid or expired token.");
            res.status(400).json({ message: "Invalid or expired token" });
            return;
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user's password and clear reset token
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpires = null;
        await user.save();

        res.status(200).json({ message: "Password successfully reset. You can now log in." });
    } catch (error) {
        console.error("Error in resetPassword:", error);
        res.status(500).json({ message: "Server error" });
    }
};
