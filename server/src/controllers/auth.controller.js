import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

function signToken(user) {                                                                 // this functions creates a json web token 
  return jwt.sign({ id: user.id, role: user.role }/*payload — data embedded inside the token*/ , process.env.JWT_SECRET, {              //secret key used to sign it
    expiresIn: "7d",                 //token stops being valid after 7 days.
  });
}

export async function signup(req, res, next) {                                          //async is tied to await to let  the postgresql quries run                                  
  try {
    const { email, password, name } = req.body;       
    if (!email || !password || !name) {
      return res.status(400).json({ error: "email, password, and name are required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });                              // this runs a prisma queries on the users table to cross check against the email been dropped 
    if (existing) return res.status(409).json({ error: "An account with that email already exists" });   //if that email is existing it will give the 409 response

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, name }, // role defaults to "client"
    });

    res.status(201).json({ token: signToken(user), user: { id: user.id, name: user.name, role: user.role } });  //gives the HTTP status 201 code then returns the both the creted jwt token and also id,name and role from user
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    res.json({ token: signToken(user), user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    next(err);
  }
}

// Tells the frontend where to route after login: dashboard if they own a
// business, homepage otherwise. This is the "no toggle at login" logic.
export async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { business: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      business: user.business, // null if they don't own one yet
    });
  } catch (err) {                   // this helps to catch any error
    next(err);                   // this help us to get the particular error that is causing a break it skips straight to your error-handling middleware
  }
}
