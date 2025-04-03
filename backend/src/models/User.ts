import mongoose, {Schema,Document, model} from "mongoose";

export interface IUser extends Document{
    name: string;
    email: string;
    password: string;
    role: "ADMIN" | "HR" | "CANDIDATE";
    resetToken?: string | null;
    resetTokenExpires?: Date | null,
}

const UserSchema = new Schema<IUser>({
    name:{type:String, required: true},
    email:{type:String, required: true},
    password:{type:String, required: true},
    role: { type: String, enum: ["ADMIN", "HR", "CANDIDATE"], required: true },
    resetToken: { type: String, default: null, select: false }, // Not fetched by default
    resetTokenExpires: { type: Date, default: null, select: false }
})

const User = model("User", UserSchema);

export default User;