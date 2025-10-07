export default {
    testEnvironment: 'node',
    verbose: true,
    clearMocks: true,
    extensionsToTreatAsEsm: [".js"],
    testMatch: ["**/?(*.)+(test).[jt]s?(x)"], // only run *.test.js files
    testPathIgnorePatterns: ["/node_modules/", "/client/"], // skip React app
};