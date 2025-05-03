import mongoose, { Schema } from "mongoose";

const meetingSchema= new Schema({
    userID:{
        type:{type:String},
        meeting_code:{type:String, required:true},
        date:{type:Date, default:Date.now,required:true},
    }
})
const Meeting = mongoose.model("meeting",meetingSchema);
export {Meeting};