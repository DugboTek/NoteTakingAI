module.exports = {
	apps: [
	  {
		name: 'scribb-client',
		script: 'index.js',
		instances: 'max',
		exec_mode: 'cluster',
		watch: true,
		env: {
		  NODE_ENV: 'production',
		},
	  },
	],
  };
  