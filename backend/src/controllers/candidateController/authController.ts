import {Request, Response} from "express";//you need to explicitly import Request and Response from Express when using TypeScript
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, {IUser} from "../../models/candidate/User"; // ./ current directory ../ move upto one directory

export const register = async(req: Request, res: Response) : Promise<void> =>{//in ts this export method is preffered
    try{
        const {name, email, password} = req.body;

        const userExists = await User.findOne({email});

        if(userExists){
            res.status(400).json({message: "User already exists"});
            return;
        }

        const hashedpassword = await bcrypt.hash(password, 10);

        const user = new User({name, email, password: hashedpassword});

        await user.save();

        res.status(201).json({message: "User registered successfully"});
    }catch(error){
        res.status(500).json({message: "Server Error"});
    }
}

export const login = async(req: Request, res: Response): Promise<void>=> {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});

        if(!user){
            res.status(400).json({messgae: "User not found please register first"});
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            res.status(400).json({message: "Invalid Password..."});
            return;
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET as string, {expiresIn: "1h"});
        //mongodb automatically creates _id field for every document
        res.json({message: "User logged in",token, usserId: user._id});
    } catch (error) {
        res.status(500).json({message: "Server Error", error});
        
    }
}
