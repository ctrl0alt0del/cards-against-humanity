import { CAHGameData, PlayerType, GameType, CAHSessionGameData, QuestionType } from '../../utils/Types';
import { GameSessionManager } from '../GameSession/GameSession';
import { PlayerCollection } from '../Player/PlayerCollection';
import { MAX_CARDS_IN_HAND, JOKER_CHANCE } from '../../utils/Constants';
import { AnswerCollection } from '../AnswerCollection/AnswerCollection';
import { updateAsync, randomFind, insertAsync, removeAsync } from '../utils/MongoUtils';
import { random } from 'lodash';
import { Meteor } from 'meteor/meteor';
import { QuestionCollection } from '../QuestionCollection/QuestionCollection';
import { CAHTurnsCollection } from '../CAHTurn/CAHTurn.collection';
import { factoryError, GameErrorType } from '../../utils/Errors';
import { PlayersManager } from '../Player/Player';

type CAHPlayer = PlayerType<CAHGameData>;

class CardsAgainstHumanityManagerClass {

    private prioritazedQuestions: QuestionType[] = [];

    async startGame(playersList: CAHPlayer[]) {
        const sessionId = await GameSessionManager.startNewSession(GameType.CardsAgainstHumanity, { currentTurnId: null });
        console.log(`starting new game session (${sessionId})`);
        await this.connectPlayersToSession(playersList.map(player => player._id), sessionId);
        const randomIndex = random(0, playersList.length - 1);
        const firstReader = playersList[randomIndex];
        this.startNewTurn(firstReader._id, sessionId);
    }

    addInitialGameData(playerId: string) {
        return updateAsync(PlayerCollection, { _id: playerId }, {
            $set: {
                gameData: {
                    answered: false,
                    cardsOnHand: [],
                    score: 0,
                    type: GameType.CardsAgainstHumanity,
                    jokersCount: 1
                }
            }
        }, { multi: false })
    }

    async connectPlayersToSession(playerIdList: string[], sessionId: string) {
        const targetSession = GameSessionManager.getSession(sessionId, GameType.CardsAgainstHumanity);
        let cardPool = this.getAnswerCardPool(playerIdList.length * MAX_CARDS_IN_HAND, sessionId);
        for (const playerId of playerIdList) {
            if (!targetSession.playersId.includes(playerId)) {
                await GameSessionManager.addPlayerToSession(sessionId, playerId);
                await this.addInitialGameData(playerId);
                let cardsToDraw = cardPool.slice(0, 6);
                cardPool = cardPool.slice(6);
                this.giveCardsToPlayer(playerId, cardsToDraw.map(card => card._id), 200)
            } else {
            }
        }
    }

    giveEachPlayerCards(sessionId: string, count: number, playerIdList?: string[]) {
        const targetSession = GameSessionManager.getSession(sessionId, GameType.CardsAgainstHumanity);
        if (!playerIdList) {
            playerIdList = targetSession.playersId;
        }
        const playerList = playerIdList.map(playerId => PlayersManager.getById(playerId));
        let cardPool = this.getAnswerCardPool(playerIdList.length * MAX_CARDS_IN_HAND, sessionId);
        for (const player of playerList) {
            const playerId = player._id;
            const currentCountOfCardsOnHand = player.gameData.cardsOnHand.length
            const countToDraw = currentCountOfCardsOnHand + count > MAX_CARDS_IN_HAND ? MAX_CARDS_IN_HAND - currentCountOfCardsOnHand : count;
            let cardsToDraw = cardPool.slice(0, countToDraw);
            cardPool = cardPool.slice(count);
            this.giveCardsToPlayer(playerId, cardsToDraw.map(card => card._id), 200);
        }
    }

    getAllUsedCardInSession(sessionId: string) {
        const targetSession = GameSessionManager.getSession<CAHSessionGameData>(sessionId, GameType.CardsAgainstHumanity);
        if (!targetSession) {
            return [];
        }
        const sessionPlayers = PlayerCollection.find({ _id: { $in: targetSession.playersId } }).fetch();
        const cardsOnHand = sessionPlayers.reduce<string[]>((total, player) => {
            return total.concat(player.gameData.cardsOnHand)
        }, []);
        const sessionTurns = CAHTurnsCollection.find({ sessionId: sessionId }).fetch();
        const playedCards = sessionTurns.reduce<string[]>((total, turn) => total.concat(turn.answers.reduce<string[]>((total2, answerData) => total2.concat(answerData.answersIdList), [])), [])
        return cardsOnHand.concat(playedCards);
    }

    getAllUsedQuestionsInSession(sessionId: string) {
        const sessionTurns = CAHTurnsCollection.find({ sessionId: sessionId }).fetch();
        return sessionTurns.map(turn => turn.questionId);
    }

    getAnswerCardPool(count: number, sessionId: string) {
        const usedCardsIdList = this.getAllUsedCardInSession(sessionId);
        return randomFind(AnswerCollection, count, usedCardsIdList).fetch();
    }

    getRandomCard(sessionId: string) {
        return this.getAnswerCardPool(1, sessionId)[0];
    }

    giveCardsToPlayer(playerId: string, cardIdList: string[], delayBetween = 0) {
        if (delayBetween === 0) {
            updateAsync(PlayerCollection, { _id: playerId }, {
                $addToSet: {
                    'gameData.cardsOnHand': { $each: cardIdList }
                }
            }, { multi: false })
        } else {
            for (let i = 0; i < cardIdList.length; i++) {
                Meteor.setTimeout(() => {
                    updateAsync(PlayerCollection, { _id: playerId }, {
                        $addToSet: {
                            'gameData.cardsOnHand': cardIdList[i]
                        }
                    }, { multi: false })
                }, i * delayBetween)
            }
        }
    }

    async startNewTurn(nextReaderId: string, sessionId: string) {
        const playedQuestions = this.getAllUsedQuestionsInSession(sessionId);
        let nextQuestion;
        if (this.prioritazedQuestions.length > 0) {
            nextQuestion = this.prioritazedQuestions[0];
            this.prioritazedQuestions = this.prioritazedQuestions.slice(1);
        } else {
            nextQuestion = randomFind(QuestionCollection, 1, playedQuestions).fetch()[0]
        }
        if (nextQuestion) {
            removeAsync(AnswerCollection, {isJoker: true}); //clean all joker cards
            console.log(`Starting new turn: ${nextQuestion.text}`);
            const session = GameSessionManager.getSession(sessionId);
            updateAsync(PlayerCollection, { _id: { $in: session.playersId } }, {
                $set: {
                    'gameData.answered': false
                }
            }, { multi: true });
            const nextTurnObj = {
                readerId: nextReaderId,
                questionId: nextQuestion._id,
                answers: [],
                sessionId: sessionId
            }
            const turnId = await insertAsync(CAHTurnsCollection, nextTurnObj);
            GameSessionManager.updateSessionById(sessionId, {
                $set: {
                    'sessionGameData.currentTurnId': turnId
                }
            })
        }
    }

    getCurrentTurnData(sessionId: string) {
        const session = GameSessionManager.getSession<CAHSessionGameData>(sessionId);
        const turnId = session.sessionGameData.currentTurnId;
        return CAHTurnsCollection.findOne({ _id: turnId });
    }

    async acceptAnswersForCurrentQuestion(playerId: string, answersIds: string[]) {
        const playerSession = GameSessionManager.getPlayerCurrentGameSession(playerId);
        const currentTurn = this.getCurrentTurnData(playerSession._id);
        const someAnswerIsJocker = answersIds.some(answerId => AnswerCollection.findOne({_id: answerId})?.isJoker);
        await updateAsync(CAHTurnsCollection, { _id: currentTurn._id }, {
            $push: {
                answers: {
                    answersIdList: answersIds,
                    isWinner: false,
                    playerId: playerId
                }
            }
        }, { multi: false });
        return updateAsync(PlayerCollection, { _id: playerId }, {
            $pullAll: {
                'gameData.cardsOnHand': answersIds
            },
            $set: {
                'gameData.answered': true
            },
            $inc: {
                'gameData.jokersCount': someAnswerIsJocker ? -1 : 0
            }
        }, { multi: false });
    }

    incrementUserScore(playerId: string, value = 1) {
        updateAsync(PlayerCollection, { _id: playerId }, { $inc: { 'gameData.score': value } }, { multi: false });
    }

    async selectBestAnswerForCurrentTurn(currentPlayerId: string, answererId: string) {
        const session = GameSessionManager.getPlayerCurrentGameSession(currentPlayerId);
        const sessionId = session._id;
        const currentTurn = this.getCurrentTurnData(sessionId);
        if (currentTurn.answers.some(answerdata => answerdata.isWinner)) {
            console.warn('answers were already accepted')
            return; //answers were already accepted
        }
        let answersWhichWon = [];
        currentTurn.answers.forEach(answ => {
            if (answ.playerId === answererId) {
                answ.isWinner = true;
                answersWhichWon = answ.answersIdList;
            }
        });
        await updateAsync(CAHTurnsCollection, { _id: currentTurn._id }, {
            $set: {
                answers: currentTurn.answers
            }
        }, { multi: false });
        await updateAsync(AnswerCollection, {_id: {$in: answersWhichWon}}, {$set: {isJoker: false}}, {multi: true}); //make winning cards non-joker to prevent deletion on new turn
        const currTurnQuestion = QuestionCollection.findOne({ _id: currentTurn.questionId });
        this.incrementUserScore(answererId, 1);
        this.giveEachPlayerCards(sessionId, currTurnQuestion.answerCount, session.playersId.filter(pId => pId !== currentPlayerId));
        this.startNewTurn(answererId, sessionId);
        for (const playerId of session.playersId) {
            this.resolveJokerForPlayer(playerId);
        }
    }

    async addNewQuestion(text: string, insertIntoQueue: boolean) {
        const id = await insertAsync(QuestionCollection, {
            text,
            answerCount: (text.match(/\_/g) || []).length || 1
        });
        if (insertIntoQueue) {
            const qObj = QuestionCollection.findOne({ _id: id });
            this.prioritazedQuestions.push(qObj);
        }
    }

    addNewAnswer(text: string, isJoker = false) {
        return insertAsync(AnswerCollection, {
            text,
            isJoker
        })
    }

    deleteAnswer(answerId: string, playerId: string) {
        const session = GameSessionManager.getPlayerCurrentGameSession(playerId);
        const usedList = this.getAllUsedCardInSession(session._id);
        if (!usedList.includes(answerId)) {
            removeAsync(AnswerCollection, { _id: answerId })
        } else {
            throw factoryError(GameErrorType.AnswerWasUsedInSession);
        }
    }
    deleteQuestion(qId: string, playerId: string) {
        const session = GameSessionManager.getPlayerCurrentGameSession(playerId);
        const usedList = this.getAllUsedQuestionsInSession(session._id);
        if (!usedList.includes(qId)) {
            removeAsync(QuestionCollection, { _id: qId })
        } else {
            throw factoryError(GameErrorType.QuestionWasUsedInSession);
        }
    }

    resolveJokerForPlayer(playerId: string) {
        const randomNumber = Math.random();
        const giveJoker = randomNumber > (1 - JOKER_CHANCE);
        if (giveJoker) {
            this.incrementJokersCountForPlayer(playerId, 1);
        }
    }

    private incrementJokersCountForPlayer(playerId: string, byCount: number) {
        updateAsync(PlayerCollection, { _id: playerId }, { $inc: { 'gameData.jokersCount': byCount } }, { multi: false });
    }

    likeJockerCard(cardId: string) {
        updateAsync(AnswerCollection, { _id: cardId }, { $set: { isJoker: false } }, { multi: false })
    }
}

export const CAHManager = new CardsAgainstHumanityManagerClass();