import { Meteor } from "meteor/meteor";
import { PlayersManager } from './Player';
import { PlayerCollection } from './PlayerCollection';
import { GameSessionManager } from '../GameSession/GameSession';

Meteor.publish("me", function () {
    const playerId = PlayersManager.getPlayerId(this);
    return PlayerCollection.find({ _id: playerId });
})

Meteor.publish("allPlayers", function (sessionId?: string) {

    const playerId = PlayersManager.getPlayerId(this);
    const session = GameSessionManager.getPlayerCurrentGameSession(playerId);
    if (sessionId && session._id === sessionId) {
        return PlayerCollection.find({ _id: { $in: session.playersId.filter(pId => pId !== playerId) } }, {
            fields: {
                readyFor: 1,
                online: 1,
                avatarId: 1,
                'gameData.answered': 1
            }
        });
    } else {
        return PlayerCollection.find({ _id: { $ne: playerId } }, {
            fields: {
                readyFor: 1,
                online: 1,
                avatarId: 1,
                'gameData.answered': 1
            }
        });
    }
});
