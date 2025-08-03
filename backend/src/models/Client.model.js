import mongoose, {Schema} from "mongoose";

// Define schema for 3rd party-apps using Credentix

const clientSchema=new Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    client_id:{
        type:String,
        required:true,
        unique:true,
    },
    client_secret:{
        type:String,
        required: true,
    },
    redirect_uris:{
        type:[String], // List of allowed redirect URIs
        required: true, 
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    }
}, {timestamps:true});


export const Client = mongoose.model("Client", clientSchema);