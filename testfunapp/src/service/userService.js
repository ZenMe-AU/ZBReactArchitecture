
const { Op, Sequelize }  = require('sequelize');
const { Users, Location } = require('../models.js');


function getUsers(coord, from, to, distance, limited) {
    try {
        return Users.findAll({
            attributes: ['id', ['deviceId', 'tid'], 'name', 'avatar'],
            // distinct: true,
            // col: 'id',
            include:[{
                model: Location,
                attributes: [],
                where:[
                    {createdAt: {[Op.between]: [from+'Z', to+'Z']}},
                    Sequelize.where(Sequelize.fn('ST_DWithin', Sequelize.col('geom'), 'SRID=4326;POINT('+ coord[0] +' '+ coord[1] +')', distance, true), true)
                ],
                group: ['tid'],
            }]
        });


        // var locationData =  await Location.findAll({
        //   attributes: ['tid'],
        //   where:[
        //     {createdAt: {[Op.between]: [from+'Z', to+'Z']}},
        //     Sequelize.where(Sequelize.fn('ST_DWithin', Sequelize.col('geom'), 'SRID=4326;POINT('+ coord[0] +' '+ coord[1] +')', distance, true), true)
        //   ]
        // });

        // var deviceIds = [];
        // locationData.forEach((location) => {
        //   deviceIds.push(location['tid']);
        // });

        // if (deviceIds.length === 0) { console.log("User is empty!"); return [];}

        // return await Users.findAll({
        //   attributes: ['id', ['deviceId', 'tid'], 'name', 'avatar'],
        //   where: {
        //       deviceId: deviceIds,
        //   },
        // });
    } catch (err) {
        console.log(err)
        return [];
    }
}

module.exports = {
    getUsers
  }