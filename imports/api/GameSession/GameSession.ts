import { insertAsync, removeAsync, updateAsync } from '../utils/MongoUtils';
import { GameSessionCollection } from "./GameSession.collection";
import { GameType, GameSessionType, GeneralGameSessionType, SessionGameData } from '../../utils/Types';
import { Mongo } from 'meteor/mongo';

class GameSessionManagerClass {
    constructor() {
        this.removeSessions();
    }
    updateSessionById(sessionId: string, modifier: Mongo.Modifier<GeneralGameSessionType>) {
        return updateAsync(GameSessionCollection, { _id: sessionId }, modifier, { multi: false });
    }
    removeSessions() {
        removeAsync(GameSessionCollection, {});
    }
    removePlayerFromAllSessions(playerId: string) {
        const playerSessions = GameSessionCollection.find({ playersId: { $in: [playerId] } });
        return playerSessions.map(session => {
            return this.removePlayerFromSession(session._id, playerId, session);
        })
    }

    getPlayerCurrentGameSession(playerId: string) {
        const userSessions = GameSessionCollection.find({ playersId: { $in: [playerId] } }).fetch();
        if(userSessions.length > 1) {
            console.warn("User has non-closed sessions");
        }
        return userSessions[0];
    }

    getSession<T>(sessionId: string, gameType?: GameType): GameSessionType<T> {
        const selector: Mongo.Selector<GeneralGameSessionType> = {
            _id: sessionId
        };
        if (gameType) {
            selector.gameType = gameType;
        }
        return GameSessionCollection.findOne(selector) as any;
    }

    async addPlayerToSession(sessionId: string, playerId: string) {
        await this.removePlayerFromAllSessions(playerId);
        return this.updateSessionById(sessionId, {
            $addToSet: {
                playersId: playerId
            }
        })
    }

    removePlayerFromSession(sessionId: string, playerId: string, session?: GeneralGameSessionType) {
        if (!session) {
            session = GameSessionCollection.findOne({ _id: sessionId });
        }
        const players = session.playersId;
        const sessionSelector = { _id: session._id };
        if (players.length === 1 && players[0] === playerId) {//i.e only this user
            return removeAsync(GameSessionCollection, sessionSelector);
        } else {
            return updateAsync(GameSessionCollection, sessionSelector, {
                $set: {
                    playersId: players.filter(pId => pId !== playerId)
                }
            }, { multi: false })
        }
    }

    async startNewSession(gameType: GameType, initialGameData: SessionGameData) {
        const sessionObject = {
            playersId: [],
            gameType,
            sessionGameData: initialGameData
        }
        return insertAsync(GameSessionCollection, sessionObject);
    }
}

export const GameSessionManager = new GameSessionManagerClass();