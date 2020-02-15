import { Meteor } from "meteor/meteor";
import { QuestionCollection } from './QuestionCollection';

Meteor.methods({
    getQuestionByIndex(index: number) {
        return QuestionCollection.findOne({ index });
    }
})