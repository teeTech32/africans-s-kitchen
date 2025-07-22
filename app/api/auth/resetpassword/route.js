import bcrypt from 'bcrypt'
import { NextResponse } from 'next/server'
import sql from "better-sqlite3"

const db = sql('app.db')

export async function POST(req) {
  try {
    const { token, password } = await req.json();
    const now = Math.floor(Date.now() / 1000);

    console.log(token)
    const recordToken = db
      .prepare(`SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > ?`)
      .get(token, now);

    if (!recordToken) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.prepare(`UPDATE users SET password = ? WHERE id = ?`)
      .run(hashedPassword, recordToken.user_id);

    db.prepare(`DELETE FROM password_reset_tokens WHERE token = ?`).run(token);

    return NextResponse.json({ message: "Password reset successfully" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}