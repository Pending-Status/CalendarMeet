module.exports = {
  testMatch: ["**/?(*.)+(test).[jt]s?(x)"], // only run *.test.js files
  testPathIgnorePatterns: ["/node_modules/", "/client/"], // skip React app
};
