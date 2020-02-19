import { Meteor } from "meteor/meteor";
import { PlayersManager } from "./Player";
import { GameType } from "/imports/utils/Types";

Meteor.methods({
    register(prevConnId?: string) {
        return PlayersManager.initializePlayer(this.connection, prevConnId);
    },
    readyFor(gameType: GameType) {
        const playerId = PlayersManager.getPlayerId(this);
        return PlayersManager.makePlayerReadyFor(playerId, gameType);
    }
})