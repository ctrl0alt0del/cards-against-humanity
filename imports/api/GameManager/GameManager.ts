import { Random } from 'meteor/random'
import { ReactiveMap } from '../../utils/ReactiveMap';
import { AnswerCollection } from '../AnswerCollection/AnswerCollection';
import { GameMessage } from '/imports/utils/GameData.utils';
import { GameMessageEnum } from "../../utils/Types";
import { MaxCardInHand } from '/imports/utils/Constants';
import { QuestionCollection } from '../QuestionCollection/QuestionCollection';
import { Meteor } from 'meteor/meteor';

export class ServerGameManager {
    private static instance: ServerGameManager = null;
    static getInstance() {
        if (!ServerGameManager.instance) {
            ServerGameManager.instance = new ServerGameManager();
        }
        return ServerGameManager.instance;
    }
    private sessions = new ReactiveMap<string, GameMessage>();
    usedAnswerIndixies: number[] = [];
    usedQuestionIndixies: number[] = [];
    createSession(listener) {
        const sessionId = Random.id();
        this.sessions.set(sessionId, null);
        this.sessions.subscribeForKey(sessionId, listener);
        return () => {
            this.sessions.delete(sessionId);
        }
    }
    giveAnswerCard(userId) {
        const index = this.getRandomAnswerIndex();
        this.sessions.set(userId, {
            message: GameMessageEnum.DrawCard,
            messageParams: {
                cardIndex: index
            }
        })
    }


    private getRandomAnswerIndex() {
        const totalAnswerCount = AnswerCollection.find({}).count();
        let index;
        do {
            index = Math.floor(Math.random() * totalAnswerCount);
        } while (this.usedAnswerIndixies.includes(index));
        this.usedAnswerIndixies.push(index);
        return index;
    }

    private getRandomQuestionIndex() {
        const totalQuestionCount = QuestionCollection.find({}).count();
        let index;
        do {
            index = Math.floor(Math.random() * totalQuestionCount);
            console.log(index, this.usedQuestionIndixies)
        } while (this.usedQuestionIndixies.includes(index));
        this.usedQuestionIndixies.push(index);
        return index;
    }

    giveTurnToPlayer(userId: string) {
        Meteor.setTimeout(() => {
            const questionIndex = this.getRandomQuestionIndex();
            this.sessions.set(userId, {
                message: GameMessageEnum.ReadQuestion,
                messageParams: {
                    questionIndex: questionIndex
                }
            })
        }, 2000);
    }

    initGame() {
        this.usedAnswerIndixies = [];
        this.usedQuestionIndixies = [];
        const userSessionIdList = [...this.sessions.keys()];
        for (const userId of userSessionIdList) {
            for (let i = 0; i < MaxCardInHand; i++) {
                this.giveAnswerCard(userId);
            }
        }
        const firstTurnUserId = userSessionIdList[Math.floor(Math.random() * userSessionIdList.length)];
        this.giveTurnToPlayer(firstTurnUserId);
    }
}
