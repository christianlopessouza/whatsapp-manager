"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const config_1 = require("./config");
const dataSource = new typeorm_1.DataSource({
    type: 'sqlite',
    database: `./database.sqlite`,
    migrations: [`./${config_1.APP_DIR}/database/migrations/*.${config_1.FILE_FORMAT}`],
    entities: [`./${config_1.APP_DIR}/models/*.${config_1.FILE_FORMAT}`],
});
exports.default = dataSource;
