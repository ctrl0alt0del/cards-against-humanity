import { ReactiveMap } from '../../utils/ReactiveMap';
import { AnswerCollection } from '../AnswerCollection/AnswerCollection';
import { GameMessage } from '/imports/utils/GameData.utils';
import { GameMessageEnum, PlayerData } from "../../utils/Types";
import { MaxCardInHand } from '/imports/utils/Constants';
import { QuestionCollection } from '../QuestionCollection/QuestionCollection';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

export class ServerGameManager {

    private static instance: ServerGameManager = null;
    static getInstance() {
        if (!ServerGameManager.instance) {
            ServerGameManager.instance = new ServerGameManager();
        }
        return ServerGameManager.instance;
    }

    private sessions = new ReactiveMap<string, GameMessage>();

    connectedUserData: PlayerData[] = [];
    usedAnswerIndixies: number[] = [];
    usedQuestionIndixies: number[] = [];
    currentQuestionIndex: number = null;
    currentQuestionAnswerIndexies: {
        selectionId: string,
        selectedIndexies: number[],
        userId: string
    }[] = [];
    currentReaderId: string = null;

    createSession(connectionId: string, listener: { (message: any): void; (newVal: GameMessage): void; }) {
        const sessionId = connectionId;
        this.sessions.set(sessionId, null);
        this.sessions.subscribeForKey(sessionId, listener);
        this.connectedUserData.push({
            sessionId,
            ready: false,
            answered: false
        })
        this.notifyAboutPlayersData();
        return () => {
            this.connectedUserData = this.connectedUserData.filter(usrData => usrData.sessionId !== sessionId);
            if(this.connectedUserData.length === 0) {
                this.resetGameState();
            }
            this.sessions.delete(sessionId);
            this.notifyAboutPlayersData();
        }
    }

    giveAnswerCard(userId: string) {
        const index = this.getRandomAnswerIndex();
        this.sessions.set(userId, {
            message: GameMessageEnum.DrawCard,
            messageParams: {
                cardIndex: index
            }
        })
    }

    notifyAboutPlayersData() {
        for (const userId of this.sessions.keys()) {
            this.sessions.set(userId, {
                message: GameMessageEnum.PlayersData,
                messageParams: {
                    players: this.connectedUserData.map(data => {
                        return Object.assign({}, data, {
                            isCurentPlayer: data.sessionId === userId
                        })
                    })
                }
            })
        }
    }

    private getRandomAnswerIndex() {
        const totalAnswerCount = AnswerCollection.find({}).count();
        let index: number;
        do {
            index = Math.floor(Math.random() * totalAnswerCount);
        } while (this.usedAnswerIndixies.includes(index));
        this.usedAnswerIndixies.push(index);
        return index;
    }

    private getRandomQuestion() {
        const totalQuestionCount = QuestionCollection.find({}).count();
        let index: number;
        do {
            index = Math.floor(Math.random() * totalQuestionCount);
        } while (this.usedQuestionIndixies.includes(index));
        this.usedQuestionIndixies.push(index);
        const targetQuestion = QuestionCollection.findOne({ index: index });
        return targetQuestion
    }

    

    giveTurnToPlayer(userId: string) {
        this.currentReaderId = userId;
        const question = this.getRandomQuestion();
        const questionIndex = question.index;
        this.currentQuestionIndex = questionIndex;
        this.connectedUserData = this.connectedUserData.map(data => Object.assign({}, data, { answered: false }));
        this.currentQuestionAnswerIndexies = [];
        this.notifyAboutPlayersData();
        for(const userData of this.connectedUserData) {
            const userId = userData.sessionId;
            this.sessions.set(userId, {
                message: GameMessageEnum.MaxAnswersOnQuestion,
                messageParams: {
                    count: question.answerCount
                }
            })
        }
        Meteor.setTimeout(() => {
            this.sessions.set(userId, {
                message: GameMessageEnum.ReadQuestion,
                messageParams: {
                    questionIndex: questionIndex
                }
            })
        }, 2000);
    }

    changePlayerReadyStatus(userId: string) {
        this.connectedUserData = this.connectedUserData.map(data =>
            data.sessionId === userId ? Object.assign({}, data, { ready: true }) : data);
        if (this.connectedUserData.every(data => data.ready)) {
            this.initGame();
        } else {
            this.notifyAboutPlayersData();
        }
    }

    selectAnswerForUser(userId: string, answerIndexies: number[]) {
        this.connectedUserData = this.connectedUserData.map(userData => {
            if (userData.sessionId === userId) {
                return Object.assign({}, userData, { answered: true });
            } else {
                return userData;
            }
        });
        this.notifyAboutPlayersData();
        this.currentQuestionAnswerIndexies.push({ selectedIndexies: answerIndexies, userId, selectionId: Random.id() });
        if (this.currentQuestionAnswerIndexies.length === this.connectedUserData.length - 1) {
            this.sessions.set(this.currentReaderId, {
                message: GameMessageEnum.AllAnswersReady,
                messageParams: {
                    data: this.currentQuestionAnswerIndexies.map(data => ({
                        selectionId: data.selectionId,
                        answerIndexies: data.selectedIndexies
                    }))
                }
            })
        }
    }

    markAnswerAsWinner(selectionId: string) {
        const targetAnswerData = this.currentQuestionAnswerIndexies.find(answerData => answerData.selectionId === selectionId);
        const winnerUserId = targetAnswerData.userId;
        this.sessions.set(winnerUserId, {
            message: GameMessageEnum.ReceivePoints,
            messageParans: null
        });
        this.startNewTurn(winnerUserId);
    }

    startNewTurn(prevTurnWinnerId: string) {
        this.currentQuestionAnswerIndexies = [];
        const prevQuestion = QuestionCollection.findOne({ index: this.currentQuestionIndex });
        this.currentQuestionIndex = null;
        const cardsToDraw = prevQuestion.answerCount;
        for (const userData of this.connectedUserData) {
            const userId = userData.sessionId;
            if (userId !== this.currentReaderId) {
                for (let i = 0; i < cardsToDraw; i++) {
                    this.giveAnswerCard(userId);
                }
            }
        }
        this.currentReaderId = null;
        this.giveTurnToPlayer(prevTurnWinnerId);
    }

    private initGame() {
        this.resetGameState();
        for (const userData of this.connectedUserData) {
            const userId = userData.sessionId;
            for (let i = 0; i < MaxCardInHand; i++) {
                this.giveAnswerCard(userId);
            }
        }
        if (this.connectedUserData.length > 1) {
            const firstTurnUserId = this.connectedUserData[Math.floor(Math.random() * this.connectedUserData.length)].sessionId;
            this.giveTurnToPlayer(firstTurnUserId);
        }
    }

    private resetGameState() {
        this.usedAnswerIndixies = [];
        this.usedQuestionIndixies = [];
        this.currentQuestionAnswerIndexies = [];
        this.currentQuestionIndex = null;
        this.currentReaderId = null;
        this.currentQuestionAnswerIndexies = [];
    }
}
