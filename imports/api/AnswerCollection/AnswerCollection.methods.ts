import { Meteor } from "meteor/meteor";
import { AnswerCollection } from './AnswerCollection';

Meteor.methods({
    getAnswerByIndex(index: number) {
        return AnswerCollection.findOne({ index });
    }
})