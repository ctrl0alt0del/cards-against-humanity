import React from 'react';
import { GeneralPlayerType, CAHTurnType } from '../../utils/Types';
import { getAvatarSrc } from '../../utils/Avatars';
import { QuestionCard } from '../QuestionCard/QuestionCard.component';
import { AnswerCard } from '../AnswerCard/AnswerCard.component';
import { GameModal } from '../Helpers/Modal';
import { GameButton } from '../Helpers/GameButton';
import Modal from 'react-awesome-modal';
import { ClientPlayer } from '../../utils/ClientPlayerManager';
import { Meteor } from 'meteor/meteor';
import { PlayerIcon } from '../Helpers/Player';

type PlayersStatusLinePropsType = {
    players: GeneralPlayerType[],
    turn: CAHTurnType,
    turns: CAHTurnType[]
}

type PlayersStatusLineStateType = {
    historyModalOpened: boolean,
    currentOptionsPlayerId: string
}


export class PlayersStatusLine extends React.Component<PlayersStatusLinePropsType, PlayersStatusLineStateType> {
    state: PlayersStatusLineStateType = {
        historyModalOpened: false,
        currentOptionsPlayerId: null
    }

    private readonly openHistoryModal = () => {
        this.setState({
            historyModalOpened: true
        })
    }

    private readonly closeHistoryModal = () => {
        this.setState({
            historyModalOpened: false
        })
    }

    private readonly openPlayerOptionsModal = (playerId: string) => {
        const myId = ClientPlayer.me()?._id;
        if (playerId === myId) {
            return;
        }
        this.setState({
            currentOptionsPlayerId: playerId
        })
    }

    private readonly closePlayerOptionsModal = () => {
        this.setState({
            currentOptionsPlayerId: null
        })
    }

    private readonly onKickButtonClick = () => {
        this.closePlayerOptionsModal();
        Meteor.call("startVotingForKickingPlayer", this.state.currentOptionsPlayerId, err => {
            if (err) {
                console.error(err);
            }
        })
    }

    render() {
        const { players, turn, turns } = this.props;
        const { historyModalOpened, currentOptionsPlayerId } = this.state;
        const currentReaderId = turn?.readerId;
        const me = ClientPlayer.me();
        const otherPlayers = players.filter(player => player._id !== me?._id);
        return (
            <div id="player-status-line-wrapper">
                <PlayerIcon player={me} height={60} className="player-icon-me"/>
                <i className="fas fa-history history-button" onClick={this.openHistoryModal} />
                {otherPlayers.map(player => {
                    const playerId = player._id;
                    const isReader = currentReaderId === playerId;
                    return (
                        <PlayerIcon  player={player} isReader={isReader} onClick={() => this.openPlayerOptionsModal(playerId)}/>
                    )
                })}
                <Modal visible={!!currentOptionsPlayerId} width="80%" onClickAway={this.closePlayerOptionsModal}>
                    <div id="player-options-wrapper">
                        <div className="player-options-item" onClick={this.onKickButtonClick}>
                            Кікнути
                        </div>
                        <div className="player-options-item">
                            Влаштувати вібровзлом жопи
                        </div>
                    </div>
                </Modal>
                <GameModal active={historyModalOpened} rootClassName='history-modal-root'>
                    <div id="history-wrapper">
                        {turns.slice().reverse().map(turnData => {
                            const answerWinner = turnData.answers.find(answer => answer.isWinner);
                            const owner = players?.find(player => player._id === answerWinner?.playerId);
                            const reader = players?.find(player => player._id === turnData?.readerId);
                            const answererAvatarSrc = getAvatarSrc(owner?.avatarId);
                            const readerAvatarSrc = getAvatarSrc(reader?.avatarId);
                            return (
                                <div className="history-turn-wrapper" key={turnData._id}>
                                    <div className="owner-avatar-and-text">
                                        <div className="owner-wrapper">
                                            <img src={readerAvatarSrc} />
                                        </div>
                                        <span>запитав (ла): </span>
                                    </div>
                                    <QuestionCard questionId={turnData.questionId} />
                                    {answerWinner && (
                                        <div className="answer-data-wrapper">
                                            <div className="owner-avatar-and-text">
                                                <div className="owner-wrapper">
                                                    <img src={answererAvatarSrc} />
                                                </div>
                                                <span>відповів (ла): </span>
                                            </div>
                                            <div className="history-turn-answers">
                                                {answerWinner.answersIdList.map(answerId => {
                                                    return (
                                                        <AnswerCard answerId={answerId} key={answerId} disableDrag />
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <div id="close-button-wrapper">
                        <GameButton onClick={this.closeHistoryModal}>
                            Закрити
                        </GameButton>
                    </div>
                </GameModal>
            </div>
        )
    }
}