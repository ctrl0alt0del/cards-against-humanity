import { Meteor } from "meteor/meteor";
import { VotingManager } from "./VotingManager";
import { PlayersManager } from '../Player/Player';

Meteor.methods({
    startVotingForKickingPlayer(playerId: string) {
        const callerId = PlayersManager.getPlayerId(this);
        VotingManager.startVotingForKickPlayer(playerId, callerId);
    },
    vote(votingId: string, votedValue: any) {
        const callerId = PlayersManager.getPlayerId(this);
        return VotingManager.voteFor(votingId, callerId, votedValue);
    }
})