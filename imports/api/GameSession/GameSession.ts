import { insertAsync, removeAsync, updateAsync } from '../utils/MongoUtils';
import { GameSessionCollection } from "./GameSession.collection";
import { GameType, GameSessionType, GeneralGameSessionType, SessionGameData } from '../../utils/Types';
import { Mongo } from 'meteor/mongo';
import { PlayersManager } from '../Player/Player';

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
            return this.removePlayerFromSession(session._id, playerId, false, session);
        })
    }

    getPlayerCurrentGameSession(playerId: string) {
        const userSessions = GameSessionCollection.find({ playersId: { $in: [playerId] } }).fetch();
        if (userSessions.length > 1) {
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
        if (this.isPlayerDisabledInSession(sessionId, playerId)) {
            return;
        }
        await this.removePlayerFromAllSessions(playerId);
        return this.updateSessionById(sessionId, {
            $addToSet: {
                playersId: playerId
            }
        })
    }

    isPlayerDisabledInSession(sessionId: string, playerId: string) {
        const session = this.getSession(sessionId);
        return session.disabledPlayersId.includes(playerId);
    }

    removePlayerFromSession(sessionId: string, playerId: string, denyAccess: boolean, session?: GeneralGameSessionType) {
        if (!session) {
            session = GameSessionCollection.findOne({ _id: sessionId });
        }
        const playersIdList = session.playersId;
        const sessionSelector = { _id: session._id };
        PlayersManager.makePlayerReadyFor(playerId, GameType.None);
        const playersOnlineList = playersIdList.map(pId => PlayersManager.getById(pId));

        if (playersOnlineList.length === 1 && playersOnlineList[0]._id === playerId) {//i.e only this user
            return removeAsync(GameSessionCollection, sessionSelector);
        } else {
            const disabledPlayersId = session.disabledPlayersId || [];
            return updateAsync(GameSessionCollection, sessionSelector, {
                $set: {
                    playersId: playersIdList.filter(pId => pId !== playerId),
                    disabledPlayersId: denyAccess ? disabledPlayersId.concat(playerId) : disabledPlayersId
                }
            }, { multi: false })
        }
    }

    async startNewSession(gameType: GameType, initialGameData: SessionGameData) {
        const sessionObject = {
            playersId: [],
            gameType,
            disabledPlayersId: [],
            sessionGameData: initialGameData
        }
        return insertAsync(GameSessionCollection, sessionObject);
    }
}

export const GameSessionManager = new GameSessionManagerClass();