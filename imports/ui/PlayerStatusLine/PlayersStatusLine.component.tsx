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
import { createPortal } from 'react-dom';
import { AddingEditor } from '../AddingEditor/AddingEditor.component';

type PlayersStatusLinePropsType = {
    players: GeneralPlayerType[],
    turn: CAHTurnType,
    turns: CAHTurnType[]
}

type PlayersStatusLineStateType = {
    historyModalOpened: boolean,
    currentOptionsPlayerId: string,
    displayAddingEditor: boolean
}


export class PlayersStatusLine extends React.Component<PlayersStatusLinePropsType, PlayersStatusLineStateType> {
    state: PlayersStatusLineStateType = {
        historyModalOpened: false,
        currentOptionsPlayerId: null,
        displayAddingEditor: false
    }

    private readonly openHistoryModal = () => {
        this.setState({
            currentOptionsPlayerId: null,
            historyModalOpened: true
        })
    }

    private readonly closeHistoryModal = () => {
        this.setState({
            historyModalOpened: false
        })
    }

    private readonly openPlayerOptionsModal = (playerId: string) => {
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

    private readonly performVibroAssHacking = () => {
        const playerId = this.state.currentOptionsPlayerId;
        this.closePlayerOptionsModal();
        Meteor.call("performVibroAssHacking", playerId, err => {
            if (err) {
                console.error(err);
            }
        })
    }

    render() {
        const { players, turn, turns } = this.props;
        const { historyModalOpened, displayAddingEditor } = this.state;
        const currentReaderId = turn?.readerId;
        const me = ClientPlayer.me();
        const otherPlayers = players.filter(player => player._id !== me?._id);
        return (
            <div id="player-status-line-wrapper">
                <PlayerIcon player={me} height={60} className="player-icon-me" onClick={() => this.openPlayerOptionsModal(me?._id)} />
                {otherPlayers.map(player => {
                    const playerId = player._id;
                    const isReader = currentReaderId === playerId;
                    return (
                        <PlayerIcon player={player} isReader={isReader} onClick={() => this.openPlayerOptionsModal(playerId)} />
                    )
                })}
                {this.getCurrentOptionsForPlayerId()}
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
                <AddingEditor display={displayAddingEditor} onClose={this.closeAddingEditor} />
            </div>
        )
    }


    private readonly leaveGame = () => {
        Meteor.call("leaveGame", err => {
            if (err) {
                console.error(err);
            }
        })
    }

    private readonly displayAddingEditor = () => {
        this.setState({
            currentOptionsPlayerId: null,
            displayAddingEditor: true
        })
    }

    private readonly closeAddingEditor = () => {
        this.setState({
            displayAddingEditor: false
        })
    }

    private getCurrentOptionsForPlayerId() {
        const cPId = this.state.currentOptionsPlayerId;
        const me = ClientPlayer.me();
        let modalContent: JSX.Element;
        let disableFixedContainer = false;
        if (cPId) {
            const isMe = cPId === me?._id;
            if (isMe) {
                disableFixedContainer = true;
                modalContent = (
                    <div id="player-menu">
                        <GameButton flat onClick={this.openHistoryModal}>
                            <i className="fas fa-history" />
                        </GameButton>
                        <GameButton flat onClick={this.displayAddingEditor}>
                            <i className="fas fa-plus"></i>
                        </GameButton>
                        <GameButton flat onClick={this.leaveGame}>
                            <i className="fas fa-sign-out-alt"></i>
                        </GameButton>
                    </div>
                )
            } else {
                modalContent = (
                    <div id="player-options-wrapper">
                        <GameButton flat onClick={this.onKickButtonClick}>
                            Кікнути
                        </GameButton>
                        <GameButton flat onClick={this.performVibroAssHacking}>
                            Влаштувати Взлом Жопи
                        </GameButton>
                    </div>
                )
            }
        } else {
            modalContent = null;
        }
        return createPortal((
            <div className={disableFixedContainer ? "player-options-modal-wrapper" : ""}>
                <Modal visible={!!cPId} width="80%" onClickAway={this.closePlayerOptionsModal} >
                    {modalContent}
                </Modal>
            </div>
        ), document.getElementById('react-target'));
    }
}