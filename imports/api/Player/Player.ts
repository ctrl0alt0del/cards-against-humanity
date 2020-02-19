import { Meteor } from 'meteor/meteor';
import { PlayerCollection } from './PlayerCollection';
import { factoryError, GameErrorType } from '/imports/utils/Errors';
import { updateAsync, insertAsync, removeAsync } from '../utils/MongoUtils';
import { GameType, PlayerType, GameData } from '/imports/utils/Types';
import { Mongo } from 'meteor/mongo';
import { CAHManager } from '../CardsAgainsHumanity/GAHManager';



class PlayersManagerClass {
    constructor() {
        this.removeAllOfflinePlayers();
    }
    private updateOne(selector: Mongo.Selector<PlayerType<GameData>>, modifier: Mongo.Modifier<PlayerType<GameData>>) {
        return updateAsync(PlayerCollection, selector, modifier, { multi: false });
    }
    private updateById(id: string, modifier: Mongo.Modifier<PlayerType<GameData>>) {
        return this.updateOne({ _id: id }, modifier);
    }
    removeAllOfflinePlayers() {
        return removeAsync(PlayerCollection, {});
    }
    findPlayerByConnectionId(conId: string) {
        return PlayerCollection.findOne({ connectionId: conId });
    }
    async initializePlayer(connection: Meteor.Connection, prevConnectionId?: string) {
        let playerId;
        const connectionId = connection.id;
        if (!prevConnectionId) {
            playerId = await this.createNewPlayer(connectionId);
        } else {
            const player = this.findPlayerByConnectionId(prevConnectionId);
            if (!player) {
                playerId = this.createNewPlayer(connectionId);
            } else {
                console.log(`user reconnected (${prevConnectionId} -> ${connectionId})`)
                playerId = player._id;
                await this.updateOne({ _id: player._id }, {
                    $set: { connectionId: connectionId }
                });
            }
        }
        connection.onClose(() => {
            console.log(`${playerId} disconnected.`);
            this.updateById(playerId, {
                $set: { online: false }
            })
        })
        return connectionId;
    }

    private async createNewPlayer(connectionId: string, ) {
        console.log(`new user connected (${connectionId})`);
        return await insertAsync(PlayerCollection, {
            connectionId: connectionId,
            readyFor: GameType.None,
            gameData: null,
            online: true
        });
    }

    getPlayerId(context: { connection: Meteor.Connection }) {
        const connectionId = context.connection.id;
        const player = PlayerCollection.findOne({ connectionId });
        if (!player) {
            throw factoryError(GameErrorType.UnknownPlayer);
        } else {
            return player._id;
        }
    }

    async makePlayerReadyFor(playerId: string, gameType: GameType) {
        await this.updateOne({ _id: playerId }, {
            $set: {
                readyFor: gameType
            }
        });
        const allPlayersOnline = PlayerCollection.find({ online: true }).fetch();
        const numberOfTotalPlayers = allPlayersOnline.length;
        const numberOfReadyPlayers = allPlayersOnline.filter(player => player.readyFor === GameType.CardsAgainstHumanity).length;
        if (numberOfReadyPlayers === numberOfTotalPlayers) {
            CAHManager.startGame(allPlayersOnline);
        }
    }
}

export const PlayersManager = new PlayersManagerClass();