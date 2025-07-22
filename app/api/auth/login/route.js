import bcrypt from "bcrypt"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import sql from "better-sqlite3"

const db = sql("app.db")
const JWT_SECRET = process.env.JWT_SECRET

export async function POST(req){
  const {email, password} = await req.json();
  if(!JWT_SECRET){
    return NextResponse.json({error: 'Server misconfiguration'})
  }
  const normalizedEmail = email.toLowerCase()
  const checkUser = db.prepare(`SELECT * FROM users WHERE email = ? `);
  const user = checkUser.get(normalizedEmail);
  if(!user){
    return NextResponse.json({error: "User doesn't exit"}, {status: 404});
  }
  const isValid = await bcrypt.compare(password, user.password);
  if(!isValid){
    return NextResponse.json({error:"Bad Credentials"}, {status: 400}) 
  }
  const token = jwt.sign({id:user.id, email:user.email}, JWT_SECRET, {expiresIn:'30m'})
  return NextResponse.json({token}, {status: 200});
}