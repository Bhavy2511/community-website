import { NextResponse } from "next/server";
import connectMongo,{hasMongoConfiguration} from "../../../lib/mongodb";
import MagazineIssue from "../../../models/MagazineIssue";
import { magazineJson } from "../../../lib/magazine";
export const runtime="nodejs";
export async function GET(){if(!hasMongoConfiguration())return NextResponse.json({issues:[],source:"fallback"});try{await connectMongo();const issues=await MagazineIssue.find({published:true}).sort({publishedAt:-1,createdAt:-1}).lean();return NextResponse.json({issues:issues.map(magazineJson),source:"mongodb"})}catch(error){console.error("Unable to load magazine",error);return NextResponse.json({issues:[],source:"fallback"})}}
