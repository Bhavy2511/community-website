import mongoose from "mongoose";

const MagazineIssueSchema = new mongoose.Schema({
  slug:{type:String,required:true,unique:true,trim:true,lowercase:true,index:true}, title:{type:String,required:true,trim:true,maxlength:180}, summary:{type:String,required:true,trim:true,maxlength:700}, content:{type:String,default:"",trim:true,maxlength:30000}, coverImage:{type:String,required:true,trim:true,maxlength:1000}, issueLabel:{type:String,required:true,trim:true,maxlength:100}, status:{type:String,default:"Draft",trim:true,maxlength:80}, published:{type:Boolean,default:false,index:true}, publishedAt:{type:Date,default:null,index:true}, author:{type:String,default:"Gujarati Community IITG",trim:true,maxlength:120}, acknowledgements:{type:String,default:"",trim:true,maxlength:5000},
},{timestamps:true});

export default mongoose.models.MagazineIssue || mongoose.model("MagazineIssue",MagazineIssueSchema);
