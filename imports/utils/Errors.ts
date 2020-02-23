import { Meteor } from "meteor/meteor";

export enum GameErrorType {
    UnknownPlayer,
    UnableReconnectUser,
    QuestionWasUsedInSession,
    AnswerWasUsedInSession
}

export function factoryError(errorType: GameErrorType) {
    return new Meteor.Error(errorType);
}