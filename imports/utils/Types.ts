export type QuestionType = {
    index: number;
    text: string;
    answerCount: number
};
export type AnswerType = {
    index: number;
    text: string;
};
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
