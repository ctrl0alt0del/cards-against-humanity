import { Meteor } from "meteor/meteor";
import { AnswerCollection } from './AnswerCollection';
import { CAHManager } from '../CardsAgainsHumanity/GAHManager';
import { PlayersManager } from '../Player/Player';

Meteor.methods({
    getAnswerById(answerId: string) {
        return AnswerCollection.findOne({ _id: answerId });
    },

    addNewAnswer(text: string, isJoker = false) {
        return CAHManager.addNewAnswer(text, isJoker);
    },

    deleteAnswer(id: string) {
        return CAHManager.deleteAnswer(id, PlayersManager.getPlayerId(this));
    },

    fetchAllAnswers() {
        return AnswerCollection.find().fetch();
    },

    likeJokerCard(cardId: string) {
        CAHManager.likeJockerCard(cardId);
    }
})