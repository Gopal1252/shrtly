import bcrypt from 'bcrypt';  
import jwt from 'jsonwebtoken';
import config from '../config/index.js';

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

function generateToken(userId) {
    return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '1h' });
};

function verifyToken(token) {
    return jwt.verify(token, config.jwtSecret);
};

export { hashPassword, comparePassword, generateToken, verifyToken };