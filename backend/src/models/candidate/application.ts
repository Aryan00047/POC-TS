import express from "express";
import mongoose, {Document, Schema, model} from 'mongoose';

export interface IApplication extends Document{
    applicationId: number;
    skills: string[];
    resume: string;
    workExp: string;
    currentCompany: string;
}

const ApplicationSchema = new Schema<IApplication>({
    applicationId: {type: Number, required: true, unique: true},
    skills: {type:[String], required: true},
    workExp:{type:String, required: true},
    resume: {type:String, required: true},
    currentCompany: {type:String, required: true},
});

const Application = model("Application", ApplicationSchema); //mongodb automatically makes schema name plural

export default Application;