import { Meteor } from "meteor/meteor";
import { PlayersManager } from "./Player";
import { GameType } from "/imports/utils/Types";
import { GameSessionManager } from '../GameSession/GameSession';

Meteor.methods({
    register(prevConnId?: string) {
        return PlayersManager.initializePlayer(this.connection, prevConnId);
    },
    readyFor(gameType: GameType) {
        const playerId = PlayersManager.getPlayerId(this);
        return PlayersManager.makePlayerReadyFor(playerId, gameType);
    },
    setAvatarForCurrentPlayer(avatarId: string) {
        const playerId = PlayersManager.getPlayerId(this);
        PlayersManager.setAvatarForPlayer(playerId, avatarId);
    },

    leaveGame() {
        const playerId = PlayersManager.getPlayerId(this);
        GameSessionManager.removePlayerFromAllSessions(playerId);
    }
})