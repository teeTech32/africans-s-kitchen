import { NextResponse } from "next/server";
import bcrypt from "bcrypt"
import sql from 'better-sqlite3'
import jwt from 'jsonwebtoken'


const db = sql('app.db')

const JWT_SECRET = process.env.JWT_SECRET

export async function POST(req){
    try{
      const {name, email, password} = await req.json();
        if(!JWT_SECRET){
          return NextResponse.json({error: 'Server misconfiguration'})
        }
        const normalizedEmail = email.toLowerCase();
        const existingUser = db.prepare(`SELECT * FROM users WHERE email = ?`).get(normalizedEmail);
        if(existingUser){
          return NextResponse.json({error: 'User already exists'}, {status: 404})
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = {
          name: name,
          email: normalizedEmail,
          password: hashedPassword
        }
        const newUser = db.prepare(`
          INSERT INTO users(name, email, password) 
          VALUES(@name, @email, @password) `).run(user)
        const userDetails = db.prepare(`
          SELECT * FROM users WHERE id = ?`).get(newUser.lastInsertRowid)  
        const token = jwt.sign({id:userDetails.id, email:userDetails.email}, JWT_SECRET, {expiresIn: '30m'})
        return NextResponse.json({token}, {status: 200}) 
    }catch(error){
        return NextResponse.json({error:'Internal Server Error'}, {status: 500})   
    }
}