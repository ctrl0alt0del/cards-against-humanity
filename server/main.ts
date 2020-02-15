import { Meteor } from 'meteor/meteor';
import { fillQuestionCollection, fillAnswerCollection } from './ServerStartup.utils';
import "../imports/api/QuestionCollection";
import "../imports/api/AnswerCollection";
import "../imports/api/GameManager";

Meteor.startup(() => {
    fillQuestionCollection();
    fillAnswerCollection();
});
