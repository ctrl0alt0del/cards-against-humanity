import React from 'react';
import {  GeneralPlayerType } from '../../utils/Types';
import { VotingReasonType, KickPlayerVotingType, GeneralVotingType } from '../../utils/VotingTypes';
import Modal from 'react-awesome-modal';
import { GameButton } from '../Helpers/GameButton';
import { Meteor } from 'meteor/meteor';
import { PlayerIcon } from '../Helpers/Player';
import { ClientPlayer } from '../../utils/ClientPlayerManager';

interface VotingDialogProps {
    votings: GeneralVotingType[],
    players: GeneralPlayerType[]
}

interface VotingDialogState {
    display: boolean
}

export class VotingDialog extends React.Component<VotingDialogProps, VotingDialogState> {
    state: VotingDialogState = {
        display: false
    }

    get votingToDisplay() {
        if (this.props.votings) {
            return this.props.votings[this.props.votings.length - 1];
        } else {
            return null;
        }
    }

    vote(votingValue: any) {
        Meteor.call("vote", this.votingToDisplay._id, votingValue, err => {
            console.error(err);
        })
    }

    componentDidUpdate(prevProps: VotingDialogProps) {
        const { votings: currVotigns } = this.props;
        const { votings: prevVotings } = prevProps;
        if (prevVotings && currVotigns) {
            if (prevVotings.length > currVotigns.length) {
                this.setState({
                    display: false
                })
            } else if (prevVotings.length < currVotigns.length) {
                this.setState({
                    display: true
                })
            }
        }
    }

    getModalContent() {
        const { players } = this.props;
        const voting = this.votingToDisplay;
        const me = ClientPlayer.me();
        const alreadyVoted = voting?.votingData.some(data => data.votedBy === me?._id);
        if (alreadyVoted) {
            return (
                <div className="voting-dialog-wrapper">
                    <div className="voting-dialog-text">
                        Очікуйте поки інші гравці проголосують.
                    </div>
                </div>
            )
        }
        switch (voting?.reason) {
            case VotingReasonType.KickPlayer:
                const kickVoting = voting as KickPlayerVotingType;
                const kickingPlayerId = kickVoting.additionalData.playerId;
                const kickingPlayer = players.find(player => player._id === kickingPlayerId);
                return (
                    <div className="voting-dialog-wrapper">
                        <div className="voting-dialog-text with-images">
                            <div className="text-with-image"> Гравця <PlayerIcon player={kickingPlayer} height={30} /> </div>було висунуто на голосування на виключення з гри. Згодний?
                        </div>
                        <div className="voting-dialog-buttons">
                            <GameButton onClick={() => this.vote(true)}>Так</GameButton>
                            <GameButton onClick={() => this.vote(false)}>Ні</GameButton>
                        </div>
                    </div>
                );
            default: return null;
        }
    }

    render() {
        const { display } = this.state;
        return (
            <Modal visible={display}>
                {this.getModalContent()}
            </Modal>
        )
    }
}