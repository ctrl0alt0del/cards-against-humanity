import { Meteor } from "meteor/meteor";
import { QuestionCollection } from './QuestionCollection';
import { CAHManager } from '../CardsAgainsHumanity/GAHManager';
import { PlayersManager } from '../Player/Player';
import { AddNewQuestionType } from "/imports/utils/Constants";

Meteor.methods({
    getQuestionById(id: string) {
        return QuestionCollection.findOne({ _id: id });
    },

    addNewQuestion(text: string, type: AddNewQuestionType) {
        return CAHManager.addNewQuestion(text, type, PlayersManager.getPlayerId(this));
    },

    deleteQuestion(id: string) {
        return CAHManager.deleteQuestion(id, PlayersManager.getPlayerId(this));
    },

    fetchAllQuestions() {
        return QuestionCollection.find().fetch();
    }
})