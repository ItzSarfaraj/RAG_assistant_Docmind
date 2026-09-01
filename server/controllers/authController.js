import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// Generate JWT token

const generateToken = (userId) => {

    return jwt.sign(
        {
            id: userId
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

};


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public

const registerUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            profileImageUrl
        } = req.body;


        // Check if user already exists

        const userExists = await User.findOne({
            email
        });

        if (userExists) {

            return res.status(400).json({
                message: "User already exists"
            });

        }


        // Hash password

        const salt = await bcrypt.genSalt(10);

        const hashedPassword =
            await bcrypt.hash(password, salt);


        // Create user

        const user = await User.create({

            name,

            email,

            password: hashedPassword,

            profileImageUrl,

            role: "member"

        });


        // Return user + JWT

        res.status(201).json({

            _id: user._id,

            name: user.name,

            email: user.email,

            role: user.role,

            profileImageUrl:
                user.profileImageUrl,

            token: generateToken(user._id)

        });

    } catch (error) {

        res.status(500).json({

            message: "Server error",

            error: error.message

        });

    }

};


// @desc    Login user
// @route   POST /api/auth/login
// @access  Public

const loginUser = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // Find user

        const user = await User.findOne({
            email
        });

        if (!user) {

            return res.status(401).json({
                message: "Invalid email or password"
            });

        }


        // Compare password

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isMatch) {

            return res.status(401).json({
                message: "Invalid email or password"
            });

        }


        // Return user + JWT

        res.status(200).json({

            _id: user._id,

            name: user.name,

            email: user.email,

            role: user.role,

            profileImageUrl:
                user.profileImageUrl,

            token: generateToken(user._id)

        });

    } catch (error) {

        res.status(500).json({

            message: "Server error",

            error: error.message

        });

    }

};


export {
    registerUser,
    loginUser
};