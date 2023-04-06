module.exports = {
	apps: [
	  {
		name: 'scribb-client',
		script: 'src/index.js',
		args: '--experimental-modules',
		instances: 'max',
		exec_mode: 'cluster',
		watch: true,
		env: {
		  NODE_ENV: 'production',
		},
	  },
	],
  };
  