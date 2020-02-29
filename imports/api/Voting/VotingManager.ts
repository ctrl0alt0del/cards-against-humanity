import { VotingReasonType, KickPlayerVotingType, GeneralVotingType } from '../../utils/VotingTypes';
import { insertAsync, updateAsync, removeAsync } from '../utils/MongoUtils';
import { VotingCollection } from './Voting.collection';
import { GameSessionManager } from '../GameSession/GameSession';
class VotingManagerClass {
    startVoting<T>(reason: VotingReasonType, votedBy: string, votedBySelection: any, additionalData: T, sessionId: string, unavailableFor: string[]) {
        return insertAsync(VotingCollection, {
            reason,
            additionalData,
            unavailableFor,
            votingData: [{
                votedBy,
                selectedChoice: votedBySelection
            }],
            active: true,
            sessionId
        });
    }

    startVotingForKickPlayer(playerId: string, votedBy: string) {
        const session = GameSessionManager.getPlayerCurrentGameSession(votedBy);
        this.startVoting(VotingReasonType.KickPlayer, votedBy, true, {
            playerId
        }, session._id, [playerId]);
    }

    voteFor<T>(votingId: string, playerId: string, votingValue: T) {
        const votingObj = VotingCollection.findOne({ _id: votingId });
        votingObj.votingData.push({
            votedBy: playerId,
            selectedChoice: votingValue
        });
        const session = GameSessionManager.getPlayerCurrentGameSession(playerId);
        const reqVotes = session.playersId.length - votingObj.unavailableFor.length;
        if (votingObj.votingData.length === reqVotes) {
            this.resolveVotingResult(votingObj);
            removeAsync(VotingCollection, { _id: votingId });
        } else {
            updateAsync(VotingCollection, { _id: votingId }, {
                $set: { votingData: votingObj.votingData }
            }, { multi: false });
        }
    }

    private resolveVotingResult(votingObj: GeneralVotingType) {
        switch (votingObj.reason) {
            case VotingReasonType.KickPlayer:
                return this.kickUserByVoting(votingObj);
        }
    }

    private async kickUserByVoting(votingObj: KickPlayerVotingType) {
        if(votingObj.votingData.every(data => data.selectedChoice)) {
            const kickPlayerId = votingObj.additionalData.playerId;
            const session = GameSessionManager.getPlayerCurrentGameSession(kickPlayerId);
            if (session) {
                await GameSessionManager.removePlayerFromSession(session._id, kickPlayerId, true, session);
            }
        }
    }
}

export const VotingManager = new VotingManagerClass()