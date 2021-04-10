module.exports = {
    apps: [{
        name: 'API',
        script: 'tsc && nodemon --exec ts-node dist/bin/www.js',

        // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
        instances: 1, // 설치될 앱 인스턴스가 갯수
        autorestart: true, // 앱 크러쉬 등으로 인해 앱이 종료될 때 재시작할지 여부 (default: true)
        watch: false, // 폴더 내의 파일에 변경이 있을때, 앱이 리로딩 여부
        ignore_watch: ["logs", "node_modules", "uploads"],
        max_memory_restart: '1G',
        env: { // 앱의 env를 설정
            NODE_ENV: 'development'
        },
        env_production: {
            NODE_ENV: 'production'
        },
        log_date_format: "YYYY-MM-DD HH:mm Z",
        out_file: "logs/out.log"
    }],

    // deploy: {
    //     production: {
    //         user: 'node',
    //         host: '212.83.163.1',
    //         ref: 'origin/master',
    //         repo: 'git@github.com:repo.git',
    //         path: '/var/www/production',
    //         'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    //     }
    // }
};