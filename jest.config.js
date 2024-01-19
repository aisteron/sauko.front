module.exports = {
  preset: "jest-puppeteer",
  globalSetup: './cfg/setup.js',
  globalTeardown: './cfg/teardown.js',
  //testEnvironment: './cfg/puppeteer_environment.js',
	testEnvironment: 'node'
};