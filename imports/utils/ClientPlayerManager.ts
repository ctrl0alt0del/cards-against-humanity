import { PlayerCollection } from '../api/Player/PlayerCollection';
class ClientPlayerClass {
    getLastConnectionId() {
        return localStorage.getItem('connectionId') || undefined;
    }
    me() {
        const connId = localStorage.getItem('connectionId');
        return PlayerCollection.findOne({ connectionId: connId });
    }
    myId(){
        return this.me()?._id;
    }
}

export const ClientPlayer = new ClientPlayerClass();