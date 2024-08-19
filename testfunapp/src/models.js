const { DataTypes }  = require("sequelize");
const { sequelize }  = require('./db.js');

const Users = sequelize.define(
  'users',
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
    avatar: {
      type: DataTypes.CHAR,
    },
    deviceId: {
      type: DataTypes.CHAR,
    }
  },
  {
    timestamps: false,
    // Other model options go here
  },
);

// // `sequelize.define` also returns the model
// console.log(Users === sequelize.models.Users); // true

// const users = await Users.findAll();
// console.log(users.every(users => users instanceof Users)); // true
// console.log('All users:', JSON.stringify(users, null, 2));


const Location = sequelize.define(
  'location',
  {
    topicId: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
    tid: {
      type: DataTypes.CHAR,
      allowNull: false,
    },
    lat: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    lon: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    response: {
      type: DataTypes.TEXT,
    }
  },
  {
    tableName: 'location',
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    updatedAt: false,
  },
);


// const location = await Location.findAll();
// console.log(location.every(location => location instanceof Location)); // true
// console.log('All location:', JSON.stringify(location, null, 2));
// let userData = []
// for (let i = 3; i <=100; i++) {
//   userData.push({
//     id: i,
//     name: i,
//     avatar: "pic/avatar_" + i + ".jpg",
//     deviceId: i
//   });
// }
// Users.bulkCreate(userData, {
//   validate: true,
// });

module.exports = {
    Users, Location
  }