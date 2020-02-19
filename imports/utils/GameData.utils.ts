import { meteorCall } from "./Common.utils"
import { DrawCardMessage, ReadQuestionMessage, QuestionType, AnswerType, PlayersDataMessage, AllAnswersReadyMessage, ReceivePointsMessage, MaxAnswersOnQuestionMessage } from './Types';

export type GameMessage = DrawCardMessage | ReadQuestionMessage | PlayersDataMessage | AllAnswersReadyMessage | ReceivePointsMessage | MaxAnswersOnQuestionMessage;

export async function getQuestionById(id: string) {
    return meteorCall<QuestionType>('getQuestionById', id);
}

export async function getAnswerById(id: string) {
    return meteorCall<AnswerType>('getAnswerById', id); 
}