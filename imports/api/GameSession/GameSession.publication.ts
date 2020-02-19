import { Meteor } from "meteor/meteor";
import { PlayersManager } from '../Player/Player';
import { GameSessionCollection } from "./GameSession.collection";

Meteor.publish("session", function () {
    const playerId = PlayersManager.getPlayerId(this);
    return GameSessionCollection.find({ playersId: { $in: [playerId] } }, {
        limit: 1
    })
})