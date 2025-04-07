const jwt = require('jsonwebtoken');
const { USERNAME, PASSWORD, JWT_SECRET_KEY } = require('../configs/constant')

const login = (username, password) => {
  try {
    if (username === USERNAME && password === PASSWORD) {
      return jwt.sign({ username }, JWT_SECRET_KEY, { expiresIn: '1h' });
    } else {
      return false
    }
  } catch (error) {
    throw error
  }
} 

module.exports = {
  login
}