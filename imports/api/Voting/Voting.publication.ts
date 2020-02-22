import { Meteor } from "meteor/meteor";
import { PlayersManager } from '../Player/Player';
import { GameSessionManager } from '../GameSession/GameSession';
import { VotingCollection } from './Voting.collection';

Meteor.publish('voting', function () {
    const playerId = PlayersManager.getPlayerId(this);
    const session = GameSessionManager.getPlayerCurrentGameSession(playerId);
    if (session) {
        const sessionId = session._id;
        return VotingCollection.find({
            sessionId,
            active: true,
            unavailableFor: { $nin: [playerId] }
        });
    }
})