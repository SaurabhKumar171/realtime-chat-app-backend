const userRepo = require("./user.repository");

exports.getUser = async (userId) => {
  return await userRepo.getUserById(userId);
};

exports.updateProfile = async (userId, payload) => {
  return await userRepo.updateUser(userId, payload);
};

exports.fetchUserById = async (userId) => {
  return await userRepo.getUserById(userId);
};

exports.searchUser = async (query) => {
  return await userRepo.searchUsers(query);
};
