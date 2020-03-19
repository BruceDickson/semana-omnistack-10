const axios = require('axios');
const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');
const { findConnections, sendMessage } = require('../websocket');

// index, show, store, update, destroy

module.exports = {
    async index(req, res) {
        const devs = await Dev.find();
        
        return res.json(devs);
    },
    async show(req, res) {
        const { github_username } = req.params;
        
        const dev = await Dev.findOne({ github_username });
        
        return res.json(dev);
    },
    async store(req, res) {
        const { github_username, techs, latitude, longitude } = req.body;
    
        let dev = await Dev.findOne({ github_username });
    
        if (!dev) { 
            const response = await axios.get(`https://api.github.com/users/${github_username}`);
            
            const { name = login, avatar_url, bio } = response.data;
            
            const techsArray = parseStringAsArray(techs);
            
            const location = {
                type: 'Point',
                coordinates: [longitude, latitude]
            };
            
            dev = await Dev.create({
                github_username,
                name,
                avatar_url,
                bio,
                techs: techsArray,
                location
            });

            //Filtrar as conexoes que estao ha no maximo 10km de distancia
            // e que o novo dev tenha pelo menos 1 das tec filtradas

            const sendSocketMessageTo = findConnections(
                { latitude, longitude },
                techsArray,
            )

            sendMessage(sendSocketMessageTo, 'new-dev', dev);
        }
    
        return res.json(dev);
    },
    async update(req, res){
        const { github_username } = req.params;
        const { techs, latitude, longitude } = req.body;
        
        let dev = await Dev.findOne({ github_username });
        
        if (dev) {
            const response = await axios.get(`https://api.github.com/users/${github_username}`);
            
            const { name = login, avatar_url, bio } = response.data;
            
            const techsArray = parseStringAsArray(techs);
            
            const location = {
                type: 'Point',
                coordinates: [longitude, latitude]
            };
            
            await dev.updateOne({name: name, avatar_url: avatar_url, bio: bio, techs: techsArray, location: location}, {_id: dev._id});
        }
        
        const devs = await Dev.find();
        
        return res.json(devs);
    },
    async destroy(req, res){
        const { _id } = req.params;
        const dev = await Dev.findOne({ _id });
        if (dev) {
            await dev.deleteOne();
        }
        const devs = await Dev.find();
        return res.json(devs);
    },
}