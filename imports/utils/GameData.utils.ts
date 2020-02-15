import { meteorCall } from "./Common.utils"
import { DrawCardMessage, ReadQuestionMessage, QuestionType, AnswerType } from "./Types"

export type GameMessage = DrawCardMessage | ReadQuestionMessage;

export async function getQuestionByIndex(index: number) {
    return meteorCall<QuestionType>('getQuestionByIndex', index);
}

export async function getAnswerByIndex(index: number) {
    return meteorCall<AnswerType>('getAnswerByIndex', index);
}