export type QuestionType = {
    index: number;
    text: string;
};
export type AnswerType = {
    index: number;
    text: string;
};
export enum GameMessageEnum {
    DrawCard,
    ReadQuestion,
    PlayersCount
}
export type DrawCardMessage = {
    message: GameMessageEnum.DrawCard;
    messageParams: {
        cardIndex: number;
    };
};
export type ReadQuestionMessage = {
    message: GameMessageEnum.ReadQuestion;
    messageParams: {
        questionIndex: number;
    };
};

export type PlayersCountMessage = {

}
