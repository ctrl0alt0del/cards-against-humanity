import { Meteor } from "meteor/meteor";
import { ServerGameManager } from './GameManager';

Meteor.methods({
    startGame() {
        const game = ServerGameManager.getInstance();
        game.changePlayerReadyStatus(this.connection.id);
    },
    selectAnswer(answerIndexies: number[]) {
        const userId = this.connection.id;
        const game = ServerGameManager.getInstance();
        game.selectAnswerForUser(userId, answerIndexies);
    },
    selectBestAnswer(selectionId: string){
        const game = ServerGameManager.getInstance();
        game.markAnswerAsWinner(selectionId);
    }
})