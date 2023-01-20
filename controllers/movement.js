const logger = require('../log/src/logger');
const movementModel = require('../models/movement');

module.exports.saveMovement = async (req, res) => {
    const movement = new movementModel({
        ...req.body, 
        sessionID: req.sessionID
    });

    try {
        const savedMovement = await movement.save();
        console.log(req.sessionID);
        console.log(req.session.id);
        logger.info(`Movement saved: ${savedMovement['x']} ${savedMovement['y']} ${savedMovement['direction']} ${savedMovement['nextMovement']}`);
        return res.status(200).send(`Movement successfully saved: ${savedMovement}`);
    } catch (e) {
        logger.error("Could not save movement");
        return res.status(500).send("Could not save movement");
    }
}