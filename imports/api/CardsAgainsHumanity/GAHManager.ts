import { CAHGameData, PlayerType, GameType, CAHSessionGameData, CAHTurnType } from '../../utils/Types';
import { GameSessionManager } from '../GameSession/GameSession';
import { PlayerCollection } from '../Player/PlayerCollection';
import { MaxCardInHand } from '../../utils/Constants';
import { AnswerCollection } from '../AnswerCollection/AnswerCollection';
import { updateAsync, randomFind, insertAsync } from '../utils/MongoUtils';
import { random } from 'lodash';
import { Meteor } from 'meteor/meteor';
import { QuestionCollection } from '../QuestionCollection/QuestionCollection';
import { CAHTurnsCollection } from '../CAHTurn/CAHTurn.collection';

type CAHPlayer = PlayerType<CAHGameData>;

class CardsAgainstHumanityManagerClass {

    async startGame(playersList: CAHPlayer[]) {
        const sessionId = await GameSessionManager.startNewSession(GameType.CardsAgainstHumanity, { currentTurnId: null });
        console.log(`starting new game session (${sessionId})`);
        await this.connectPlayersToSession(playersList.map(player => player._id), sessionId);
        const randomIndex = random(0, playersList.length - 1);
        const firstReader = playersList[randomIndex];
        this.startNewTurn(firstReader._id, sessionId);
    }

    addInitialGameDataIfNeccessary(playerId: string) {
        const targetPlayer = PlayerCollection.findOne({ _id: playerId });
        if (!targetPlayer.gameData) {
            return updateAsync(PlayerCollection, { _id: playerId }, {
                $set: {
                    gameData: {
                        answered: false,
                        cardsOnHand: [],
                        isReader: false,
                        score: 0,
                        type: GameType.CardsAgainstHumanity
                    }
                }
            }, { multi: false })
        }
    }

    async connectPlayersToSession(playerIdList: string[], sessionId: string) {
        const targetSession = GameSessionManager.getSession(sessionId, GameType.CardsAgainstHumanity);
        let cardPool = this.getAnswerCardPool(playerIdList.length * MaxCardInHand, sessionId);
        for (const playerId of playerIdList) {
            if (!targetSession.playersId.includes(playerId)) {
                await GameSessionManager.addPlayerToSession(sessionId, playerId);
                await this.addInitialGameDataIfNeccessary(playerId);
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
        let cardPool = this.getAnswerCardPool(playerIdList.length * MaxCardInHand, sessionId);
        for (const playerId of playerIdList) {
            let cardsToDraw = cardPool.slice(0, count);
            cardPool = cardPool.slice(count);
            this.giveCardsToPlayer(playerId, cardsToDraw.map(card => card._id), 200)
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
        const nextQuestion = randomFind(QuestionCollection, 1, playedQuestions).fetch()[0];
        if (nextQuestion) {
            console.log(`Starting new turn: ${nextQuestion.text}`);
            const session = GameSessionManager.getSession(sessionId);
            updateAsync(PlayerCollection, { _id: { $in: session.playersId } }, {
                $set: {
                    'gameData.answered': false
                }
            }, { multi: true });
            Meteor.setTimeout(async () => {
                const nextTurnObj = {
                    readerId: nextReaderId,
                    questionId: nextQuestion._id,
                    answers: [],
                    sessionId: sessionId
                }
                const turnId = await insertAsync(CAHTurnsCollection, nextTurnObj);
                console.log(turnId);
                GameSessionManager.updateSessionById(sessionId, {
                    $set: {
                        'sessionGameData.currentTurnId': turnId
                    }
                })
            }, 1000)
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
            }
        }, { multi: false });
    }

    incrementUserScore(playerId: string, value = 1) {
        updateAsync(PlayerCollection, { _id: playerId }, { $inc: { 'gameData.score': value } }, { multi: false });
    }

    selectBestAnswerForCurrentTurn(currentPlayerId: string, answererId: string) {
        const session = GameSessionManager.getPlayerCurrentGameSession(currentPlayerId);
        const sessionId = session._id;
        const currentTurn = this.getCurrentTurnData(sessionId);
        const currTurnQuestion = QuestionCollection.findOne({ _id: currentTurn.questionId });
        this.incrementUserScore(answererId, 1);
        this.giveEachPlayerCards(sessionId, currTurnQuestion.answerCount, session.playersId.filter(pId => pId !== currentPlayerId));
        this.startNewTurn(answererId, sessionId);

    }
}

export const CAHManager = new CardsAgainstHumanityManagerClass();