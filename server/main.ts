import { Meteor } from 'meteor/meteor';
import { fillQuestionCollection, fillAnswerCollection } from './ServerStartup.utils';
import "../imports/api/QuestionCollection";
import "../imports/api/AnswerCollection";
import "../imports/api/GameManager";
import '../imports/api/Player';
import '../imports/api/GameSession';
import '../imports/api/CAHTurn';
import '../imports/api/CardsAgainsHumanity';

Meteor.startup(() => {
    fillQuestionCollection();
    fillAnswerCollection();
});
