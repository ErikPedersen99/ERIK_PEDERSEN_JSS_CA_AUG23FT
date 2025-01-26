const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');


const getUsers = () => {
  const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');
  const data = fs.readFileSync(usersFilePath, 'utf8');
  return JSON.parse(data);
};


const findUserByUsername = (username) => {
  const users = getUsers();
  return users.find(user => user.username === username);
};


const findUserById = (id) => {
  const users = getUsers();
  return users.find(user => user.id === id);
};

module.exports = { findUserByUsername, findUserById };
