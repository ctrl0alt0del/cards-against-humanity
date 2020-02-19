import { Meteor } from "meteor/meteor";
import { ServerGameManager } from './GameManager';

Meteor.methods({
    startGame() {
        const game = ServerGameManager.getInstance();
        game.changePlayerReadyStatus(this.connection.id);
    },
})