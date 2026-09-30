import { NextResponse } from "next/server";
import connectMongo from "../../../../lib/mongodb";
import MagazineIssue from "../../../../models/MagazineIssue";
import { magazineJson } from "../../../../lib/magazine";
export const runtime="nodejs";
export async function GET(_request,{params}){try{await connectMongo();const issue=await MagazineIssue.findOne({slug:params.slug,published:true}).lean();if(!issue)return NextResponse.json({error:"Issue not found."},{status:404});return NextResponse.json({issue:magazineJson(issue)})}catch{return NextResponse.json({error:"Unable to load this issue."},{status:503})}}
