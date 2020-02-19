export type QuestionType = {
    _id: string,
    index: number;
    text: string;
    answerCount: number
};
export type AnswerType = {
    _id: string,
    index: number;
    text: string;
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
    isReader: boolean,
    answered: boolean
}

export type GameData = CAHGameData;

export type PlayerType<T> = {
    _id: string,
    connectionId: string,
    readyFor: GameType,
    online: boolean,
    gameData: T
}

export type GeneralPlayerType = PlayerType<GameData>;

export enum GameMessageEnum {
    DrawCard,
    ReadQuestion,
    PlayersData,
    AllAnswersReady,
    ReceivePoints,
    MaxAnswersOnQuestion
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

export type PlayerData = {
    sessionId: string,
    ready: boolean;
    answered: boolean;
    isCurentPlayer?: boolean;
};

export type PlayersDataMessage = {
    message: GameMessageEnum.PlayersData,
    messageParams: {
        players: PlayerData[]
    }
}

export type AnswerSelectionType = {
    selectionId: string;
    answerIndexies: number[];
};

export type AllAnswersReadyMessage = {
    message: GameMessageEnum.AllAnswersReady,
    messageParams: {
        data: AnswerSelectionType[]
    }
}

export type ReceivePointsMessage = {
    message: GameMessageEnum.ReceivePoints,
    messageParans: null
}

export type MaxAnswersOnQuestionMessage = {
    message: GameMessageEnum.MaxAnswersOnQuestion,
    messageParams: {
        count: number
    }
}
