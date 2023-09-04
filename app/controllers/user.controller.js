const db = require('../models')
const User = db.user;

exports.allAccess = async(req, res) => {
  try {
  const users = await User.find({}, 'username'); // Fetch all users and only retrieve the 'username' field
  const username = users.map(user => user.username); // Extract usernames from the fetched users

  res.status(200).json(username); // Return an array of usernames
} catch (error) {
  res.status(500).json({ message: 'An error occurred while fetching usernames.' });
}
};

  
exports.userBoard = (req, res) => {
    res.status(200).send("User Content.");
  };
  
exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
  };
  
exports.moderatorBoard = (req, res) => {
    res.status(200).send("Moderator Content.");
  };