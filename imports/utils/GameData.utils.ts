import { meteorCall } from "./Common.utils"
import { DrawCardMessage, ReadQuestionMessage, QuestionType, AnswerType, PlayersDataMessage, AllAnswersReadyMessage, ReceivePointsMessage, MaxAnswersOnQuestionMessage } from './Types';

export type GameMessage = DrawCardMessage | ReadQuestionMessage | PlayersDataMessage | AllAnswersReadyMessage | ReceivePointsMessage | MaxAnswersOnQuestionMessage;

export async function getQuestionByIndex(index: number) {
    return meteorCall<QuestionType>('getQuestionByIndex', index);
}

export async function getAnswerByIndex(index: number) {
    return meteorCall<AnswerType>('getAnswerByIndex', index); 
}