import { PlayersManager } from '../Player/Player';
declare var Streamy: any;

class DirectMessagesClass {
    private playerIdToSocketMap = new Map<string, any>();
    constructor() {
        Streamy.onConnect(socket => {
            const connectionId = socket.__sid;
            if (connectionId) {
                this.playerIdToSocketMap.set(connectionId, socket);
            }
        })
    }
    emit<T>(playerId: string, data: T) {
        const player = PlayersManager.getById(playerId);
        if (player) {
            const socket = this.playerIdToSocketMap.get(player.connectionId);
            if (socket) {
                Streamy.emit('message', data, socket);
            }
        }
    }
}

export const DirectMessages = new DirectMessagesClass();