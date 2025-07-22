import sql from "better-sqlite3"
import {v4 as uuidv4} from "uuid"
import { NextResponse } from "next/server";
import {sendResetEmail} from "@/lib/email"

const db = sql("app.db")

export async function POST(req){
  const body = await req.json();
  const email = body.email?.toLowerCase();
  const checkUserEmail = db.prepare(`
    SELECT * FROM users WHERE email = ?`)
    const user = checkUserEmail.get(email);
    if(!user){
      return NextResponse.json({error: "This userEmail never exist"}, {status: 400})
    }
  const token = uuidv4()
  const expires_at = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour from now
  const forgetpasswordToken = {
    user_id: user.id,
    token: token,
    expires_at: expires_at
  }
  const passwordToken = db.prepare(`
    INSERT INTO password_reset_tokens(user_id, token, expires_at) 
    VALUES(@user_id, @token, @expires_at)`)
  passwordToken.run(forgetpasswordToken)  
  await sendResetEmail(email, token)
  return NextResponse.json({message:"Email was sent, check your email to procede"}, {status:200})
}