const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
    console.log('Authorization header:', req.headers.authorization); // Debug header

    if (!token) {
        console.error('Token is missing');
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        console.log('Decoded token:', decoded);

        const user = await User.findById(decoded.id);
        if (!user) {
            console.error('User not found for token:', decoded.id);
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = user; // Attach user to the request object
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        res.status(401).json({ message: 'Invalid token', error: error.message });
    }
};