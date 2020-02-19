import { Meteor } from "meteor/meteor";
import { PlayersManager } from '../Player/Player';
import { GameSessionManager } from '../GameSession/GameSession';
import { CAHTurnsCollection } from "./CAHTurn.collection";

Meteor.publish("turns", function () {
    const playerId = PlayersManager.getPlayerId(this);
    const session = GameSessionManager.getPlayerCurrentGameSession(playerId);
    if (session) {
        return CAHTurnsCollection.find({ sessionId: session._id });
    }
})