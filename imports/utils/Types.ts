
export type QuestionType = {
    _id: string,
    text: string;
    answerCount: number
};
export type AnswerType = {
    _id: string,
    text: string,
    isJoker: boolean
};

export type CAHTurnAnswersData = {
    playerId: string;
    answersIdList: string[];
    isWinner: boolean;
};

export type CAHTurnType = {
    _id: string,
    readerId: string,
    questionId: string,
    answers: CAHTurnAnswersData[],
    newQuestionWasAdded?: boolean,
    questionWasForwarded?: boolean,
    sessionId: string
}

export type CAHSessionGameData = {
    currentTurnId: string
}

export type SessionGameData = CAHSessionGameData;

export type GeneralGameSessionType = GameSessionType<SessionGameData>;

export type GameSessionType<T> = {
    _id: string,
    gameType: GameType,
    playersId: string[],
    disabledPlayersId: string[],
    sessionGameData: T
}

export enum GameType {
    None,
    CardsAgainstHumanity
}

export type CAHGameData = {
    type: GameType.CardsAgainstHumanity
    cardsOnHand: string[],
    score: number,
    answered: boolean,
    jokersCount: number
}

export type GameData = CAHGameData;

export type PlayerType<T> = {
    _id: string,
    connectionId: string,
    readyFor: GameType,
    online: boolean,
    avatarId: string,
    gameData: T
}

export type GeneralPlayerType = PlayerType<GameData>;


export enum DirectMessagesEnum {
    AssHack
}

