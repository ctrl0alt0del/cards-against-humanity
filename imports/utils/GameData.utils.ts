import { meteorCall, EntityFetcher } from "./Common.utils"
import { DrawCardMessage, ReadQuestionMessage, QuestionType, AnswerType, PlayersDataMessage, AllAnswersReadyMessage, ReceivePointsMessage, MaxAnswersOnQuestionMessage } from './Types';

export type GameMessage = DrawCardMessage | ReadQuestionMessage | PlayersDataMessage | AllAnswersReadyMessage | ReceivePointsMessage | MaxAnswersOnQuestionMessage;

export const getQuestionById = EntityFetcher(async function (id: string) {
    return meteorCall<QuestionType>('getQuestionById', id);
});

export const getAnswerById = EntityFetcher(async function (id: string) {
    return meteorCall<AnswerType>('getAnswerById', id);
});