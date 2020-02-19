import { Meteor } from "meteor/meteor";
import { PlayersManager } from '../Player/Player';
import { CAHManager } from './GAHManager';

Meteor.methods({
    selectAnswersForCurrentQuestion(answersIdList: string[]) {
        const playerId = PlayersManager.getPlayerId(this);
        CAHManager.acceptAnswersForCurrentQuestion(playerId, answersIdList);
    },
    selectBestAnswerForCurrentQuestion(answererId: string) {
        const playerId = PlayersManager.getPlayerId(this);
        CAHManager.selectBestAnswerForCurrentTurn(playerId, answererId);
    }
})