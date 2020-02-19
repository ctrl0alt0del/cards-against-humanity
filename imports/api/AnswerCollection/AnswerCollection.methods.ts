import { Meteor } from "meteor/meteor";
import { AnswerCollection } from './AnswerCollection';

Meteor.methods({
    getAnswerById(answerId: string) {
        return AnswerCollection.findOne({ _id: answerId });
    }
})