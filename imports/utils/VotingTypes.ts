export type GeneralVotingType = VotingType<any, any>;

export enum VotingReasonType {
    KickPlayer
}
export type KickPlayerVotingType = VotingType<boolean, {
    playerId: string;
}>;
export interface VotingType<T, AddT> {
    _id: string;
    reason: VotingReasonType;
    additionalData: AddT;
    unavailableFor?: string[];
    active: boolean;
    sessionId: string;
    votingData: {
        votedBy: string;
        selectedChoice: T;
    }[];
}
