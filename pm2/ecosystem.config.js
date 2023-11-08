module.exports = {
    apps : [{
        name   : "kayaroll-api",
        script : 'server.js',
        env: {
            "NODE_ENV": "local"
        },
        env_staging: {
            "NODE_ENV": "staging"
        },
        env_production: {
            "NODE_ENV": "production"
        }
    }]
}