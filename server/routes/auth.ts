// server/routes/auth.ts

import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { UserModel } from "../mongo-db"; 
import { ApiResponse } from "@shared/api";

// Fallback is defined in the .env, but provided here for type safety/dev
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me"; 

// Interface for the client response
interface AuthResponseData {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const registerUser: RequestHandler = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: "Missing required fields" } as ApiResponse<any>);
  }

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, error: "User already exists with this email" } as ApiResponse<any>);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Auto-generate a unique ID for the user
    const newUserId = new mongoose.Types.ObjectId().toString();

    const newUser = new UserModel({
      id: `user-${newUserId}`,
      name,
      email,
      passwordHash,
    });

    const savedUser = await newUser.save();
    
    // Create JWT token for the session
    const token = jwt.sign({ id: savedUser.id }, JWT_SECRET, { expiresIn: '7d' });
    
    const responseData: AuthResponseData = {
      token,
      user: { id: savedUser.id, name: savedUser.name, email: savedUser.email },
    };

    res.status(201).json({ success: true, data: responseData, message: "Registration successful" } as ApiResponse<AuthResponseData>);

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, error: "Server error during registration" } as ApiResponse<any>);
  }
};

export const loginUser: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Missing required fields" } as ApiResponse<any>);
  }

  try {
    // Find user by email and explicitly select the passwordHash
    const user = await UserModel.findOne({ email }).select('+passwordHash');
    
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid email or password" } as ApiResponse<any>);
    }

    // Since we used .select('+passwordHash'), we can now access the hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid email or password" } as ApiResponse<any>);
    }
    
    // Create JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    const responseData: AuthResponseData = {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    };

    res.status(200).json({ success: true, data: responseData, message: "Login successful" } as ApiResponse<AuthResponseData>);

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: "Server error during login" } as ApiResponse<any>);
  }
};