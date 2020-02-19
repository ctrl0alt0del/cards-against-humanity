import { Meteor } from "meteor/meteor";
import { PlayersManager } from './Player';
import { PlayerCollection } from './PlayerCollection';

Meteor.publish("me", function () {
    const playerId = PlayersManager.getPlayerId(this);
    return PlayerCollection.find({ _id: playerId });
})

Meteor.publish("allPlayers", function () {

    const playerId = PlayersManager.getPlayerId(this);
    return PlayerCollection.find({ _id: { $ne: playerId } }, {
        fields: {
            readyFor: 1,
            online: 1,
            'gameData.answered': 1
        }
    });
})