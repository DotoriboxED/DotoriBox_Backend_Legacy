const path = require('path');

const options = {
    swaggerDefinition: {
        info: {
            title: "DotoriBox Back-End Service",
            version: "1.0.0",
            description: "도토리박스 설문조사 Back-End Server입니다."
        },
        host: "localhost:3000",
        basePath: '/'
    },
    apis: [path.join(__dirname + '/routes/api/survey.js')]
};

module.exports = options;