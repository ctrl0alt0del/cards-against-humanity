import { Meteor } from "meteor/meteor";
import { QuestionCollection } from './QuestionCollection';

Meteor.methods({
    getQuestionById(id: string) {
        return QuestionCollection.findOne({ _id: id });
    }
})