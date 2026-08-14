import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(

{

title:{
type:String,
required:true,
},

message:{
type:String,
required:true,
},

type:{
type:String,
enum:[
"lead",
"customer",
"deal",
"task",
"followup"
],
default:"lead",
},

isRead:{
type:Boolean,
default:false,
},

createdFor:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
default:null,
},

audience:{
type:String,
enum:["all","admin"],
default:"all",
},

},

{
timestamps:true,
}

);

const Notification=mongoose.model(
"Notification",
notificationSchema
);

export default Notification;