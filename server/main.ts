import { Meteor } from 'meteor/meteor';
import { fillQuestionCollection, fillAnswerCollection } from './ServerStartup.utils';
import "../imports/api/QuestionCollection";
import "../imports/api/AnswerCollection";
import "../imports/api/Voting";
import '../imports/api/Player';
import '../imports/api/GameSession';
import '../imports/api/CAHTurn';
import '../imports/api/CardsAgainsHumanity';
import '../imports/api/DirectMessages';

Meteor.startup(() => {
    /*fillQuestionCollection();
    fillAnswerCollection();*/
});
