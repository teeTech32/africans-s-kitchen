"use server"

import { NextResponse } from "next/server"
import sql from "better-sqlite3"

const db = sql("app.db")

export async function getUser(email){
  try{
   const user =  db.prepare(`
    SELECT * FROM users WHERE email = ?`).get(email)
    return NextResponse.json({user}, {status: 200})
  }catch(error){
    return NextResponse.json({error: "User doesn't exists"}, {status: 400})
  }
}