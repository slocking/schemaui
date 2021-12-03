const _           = require('lodash');
const { Sequelize, Model, DataTypes } = require('sequelize');
const randStr     = () => String(_.random(1000, 9999));

const sequelize = new Sequelize('mysql://root@localhost:3306/schemaui');

class User extends Model {
    static async createUser() {
        await this.sync();

        return this.create({
            name: `user-${randStr()}`,
            email: `user-${randStr()}@example.com`,
            password: randStr(),
        });
    }
}
User.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, { sequelize, tableName: 'users', modelName: 'users', timestamps: false });

module.exports = User;
