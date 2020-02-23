import { Meteor } from "meteor/meteor";
import { QuestionCollection } from './QuestionCollection';
import { CAHManager } from '../CardsAgainsHumanity/GAHManager';
import { PlayersManager } from '../Player/Player';

Meteor.methods({
    getQuestionById(id: string) {
        return QuestionCollection.findOne({ _id: id });
    },

    addNewQuestion(text: string, insertIntoQueue: boolean) {
        return CAHManager.addNewQuestion(text, insertIntoQueue);
    },

    deleteQuestion(id: string) {
        return CAHManager.deleteQuestion(id, PlayersManager.getPlayerId(this));
    },

    fetchAllQuestions() {
        return QuestionCollection.find().fetch();
    }
})