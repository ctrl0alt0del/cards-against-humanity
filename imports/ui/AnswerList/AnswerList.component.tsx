import React from 'react';
import { AnswerCard } from '../AnswerCard/AnswerCard.component';
import { TransitionGroup } from "react-transition-group"
import { DraggableEvent } from 'react-draggable';
import { ImmediateCSSTransition } from '../Helpers/ImmediateCSSTransition.component';
import { getQuestionById } from '/imports/utils/GameData.utils';
import { GameButton } from '../Helpers/GameButton';
import { CAHTurnType } from '../../utils/Types';
import { ClientPlayer } from '../../utils/ClientPlayerManager';
import { meteorCall } from '/imports/utils/Common.utils';
import { JOCKER_ANSWER_ID } from '/imports/utils/Constants';
import Modal from 'react-awesome-modal';

type AnswerListPropsType = {
    answers: string[],
    currentQuestionId: string,
    turn: CAHTurnType
}

type AnswerListStateType = {
    dropableAreaHighlighted: boolean,
    answerWasAccepted: boolean,
    selectedAnswers: string[],
    maxAnswersCount: number,
    openAnswerCreateDialog: boolean,
    jokerWasUsed: boolean,
    newAnswerText: string
}

export class AnswerList extends React.Component<AnswerListPropsType, AnswerListStateType> {
    state: AnswerListStateType = {
        dropableAreaHighlighted: false,
        answerWasAccepted: false,
        selectedAnswers: [],
        maxAnswersCount: 1,
        jokerWasUsed: false,
        openAnswerCreateDialog: false,
        newAnswerText: ''
    }

    private rootElRef = null;

    componentDidUpdate(prevProps: AnswerListPropsType) {
        if (this.props.currentQuestionId && prevProps.currentQuestionId !== this.props.currentQuestionId) {
            this.resolveMaxAnswersForCurrentQuestion();
        }
        const currentTurn = this.props.turn;
        const prevTurn = prevProps.turn;
        const myId = ClientPlayer.myId();
        const currMyAnswers = currentTurn?.answers.find(answerData => answerData.playerId === myId);
        const prevMyAnswers = prevTurn?.answers.find(answerData => answerData.playerId === myId);
        if ((currMyAnswers && !prevMyAnswers)) {
            this.setState({
                selectedAnswers: currMyAnswers.answersIdList
            })
        }
    }

    componentDidMount() {
        if (this.props.currentQuestionId) {
            this.resolveMaxAnswersForCurrentQuestion();
        }
    }

    async resolveMaxAnswersForCurrentQuestion() {
        const currQId = this.props.currentQuestionId;
        this.setState({
            selectedAnswers: [],
            answerWasAccepted: false,
            jokerWasUsed: false,
            openAnswerCreateDialog: false
        })
        const qData = await getQuestionById(currQId);
        if (qData) {
            this.setState({
                maxAnswersCount: qData.answerCount
            })
        }
    }


    onDragAnswerHandler = (event: MouseEvent) => {
        if (this.state.selectedAnswers.length >= this.state.maxAnswersCount) {
            return;
        }
        const draggableEl = event.target as HTMLElement;
        const elRect = draggableEl.getBoundingClientRect();
        const isDraggedOverArea = this.isElementOverSelectableArea(elRect);
        if (isDraggedOverArea) {
            if (this.state.dropableAreaHighlighted !== true) {
                this.setState({
                    dropableAreaHighlighted: true
                });
            }
        } else if (this.isPageShouldBeScrolledUp(elRect)) {
            this.rootElRef.scrollTo(0, this.rootElRef.scrollTop - 10);
        } else if (this.state.dropableAreaHighlighted !== false) {
            this.setState({ dropableAreaHighlighted: false })
        }
    }

    onDropAnswerHandler(answerId: string, event: DraggableEvent) {
        if (this.state.selectedAnswers.length >= this.state.maxAnswersCount) {
            return false;
        } else {
            const draggableEl = event.target as HTMLElement;
            const elRect = draggableEl.getBoundingClientRect();
            const isDraggedOverArea = this.isElementOverSelectableArea(elRect);
            if (isDraggedOverArea) {
                this.setState({
                    dropableAreaHighlighted: false
                })
                this.onAnswerSelected(answerId);
                return true;
            }
        }
        return false;

    }

    onResetAnswerListButtonClick = () => {
        this.setState({
            selectedAnswers: [],
            jokerWasUsed: false
        })
    }

    onAcceptAnswerButtonClick = () => {
        this.setState({
            answerWasAccepted: true
        })
        return meteorCall("selectAnswersForCurrentQuestion", this.state.selectedAnswers)

    }

    onAnswerSelected(answerId: string) {
        if (answerId === JOCKER_ANSWER_ID) {
            this.setState({
                jokerWasUsed: true,
                openAnswerCreateDialog: true
            })
        } else {
            const prevSelectedAnswers = this.state.selectedAnswers;
            this.setState({
                selectedAnswers: prevSelectedAnswers.concat(answerId)
            })
        }
    }

    private isElementOverSelectableArea(boundingRect: DOMRect) {
        const { top, height } = boundingRect;
        const isDraggedOverArea = this.rootElRef.scrollTop === 0 && (top + height) / window.innerHeight < 0.3;
        return isDraggedOverArea;
    }

    private isPageShouldBeScrolledUp(boundingRect: DOMRect) {
        const { top, height } = boundingRect;
        return this.rootElRef.scrollTop > 0 && (top + height) / window.innerHeight < 0.3;
    }

    private readonly closeNewAnswerDialog = (saved = false) => {
        this.setState({
            openAnswerCreateDialog: false,
            newAnswerText: '',
            jokerWasUsed: !saved
        })
    }

    private readonly onNewAnswerTextareaChange = event => {
        const value = event.currentTarget.value;
        this.setState({
            newAnswerText: value
        })
    }

    private onSaveNewAnswerClick = async () => {
        const answerText = this.state.newAnswerText;
        const newAnswerId = await meteorCall<string>("addNewAnswer", answerText, true);
        this.setState({
            selectedAnswers: [newAnswerId],
            openAnswerCreateDialog: false,
            jokerWasUsed: true
        });

    }

    render() {
        const { answers, turn } = this.props;
        const me = ClientPlayer.me();
        const {
            dropableAreaHighlighted,
            answerWasAccepted,
            selectedAnswers,
            maxAnswersCount,
            openAnswerCreateDialog,
            jokerWasUsed,
            newAnswerText
        } = this.state;
        const selectedAnswerClass = selectedAnswers && selectedAnswers.length === maxAnswersCount ? 'selected' : (dropableAreaHighlighted ? 'highlighted' : '');
        const myAnswerInTurn = turn?.answers.some(answerData => answerData.playerId === me?._id) || false;
        const jokerAvailable = me?.gameData?.jokersCount > 0;
        const answersToList = answers.filter(answer => !selectedAnswers.includes(answer));
        const aspectRatioVal = 1 / (Math.ceil((answersToList.length + 1) / 2) + 1);
        return (
            <div id="answer-pick-state-wrapper" ref={ref => this.rootElRef = ref}>
                <div id="selected-answer-wrapper" className={selectedAnswerClass}>
                    {selectedAnswers && selectedAnswers.length > 0 ? (
                        selectedAnswers.map((answerIndex, i) => {
                            const contStyle: any = {};
                            const totalCount = selectedAnswers.length;
                            if (totalCount > 1) {
                                contStyle.left = (75 / totalCount) * i + "%";
                            }
                            return (
                                <div className="select-answer-container" style={contStyle}>
                                    <AnswerCard disableDrag answerId={answerIndex} key={`selected_answer_${answerIndex}`} />
                                </div>
                            )
                        })
                    ) : (
                            <span className="select-answer-explain">Тягни сюди карточку, щоб вибрати відповідний варіант</span>
                        )}
                </div>
                <div id="select-answer-control-buttons">
                    {selectedAnswers.length > 0 && !answerWasAccepted && !myAnswerInTurn && (
                        <GameButton onClick={this.onResetAnswerListButtonClick}>
                            Reset
                        </GameButton>
                    )}
                    {selectedAnswers.length === maxAnswersCount && (!answerWasAccepted && !myAnswerInTurn) && (
                        <GameButton onClick={this.onAcceptAnswerButtonClick}>
                            Accept
                        </GameButton>
                    )}
                </div>
                <TransitionGroup component="div" id="answer-pick-state-cards-list">
                    {answersToList.map((answerId) => {
                        return (
                            <ImmediateCSSTransition key={`answer_${answerId}`} classNames="game-card-anim" timeout={200}>
                                <div className="answer-card-super-wrapper">
                                    <AnswerCard
                                        answerId={answerId}
                                        onDrag={this.onDragAnswerHandler}
                                        onDrop={(ev) => this.onDropAnswerHandler(answerId, ev)}
                                        aspectRatio={aspectRatioVal}
                                    />
                                </div>
                            </ImmediateCSSTransition>
                        )
                    })}
                    {
                        jokerAvailable && !jokerWasUsed && (

                            <ImmediateCSSTransition key={`answer_joker`} classNames="game-card-anim" timeout={200}>
                                <div className="answer-card-super-wrapper">
                                    <AnswerCard
                                        answerId={JOCKER_ANSWER_ID}
                                        onDrag={this.onDragAnswerHandler}
                                        onDrop={(ev) => this.onDropAnswerHandler(JOCKER_ANSWER_ID, ev)}
                                        aspectRatio={.2}
                                    />
                                </div>
                            </ImmediateCSSTransition>
                        )
                    }
                </TransitionGroup>
                <Modal visible={openAnswerCreateDialog} onClickAway={this.closeNewAnswerDialog}>
                    <div id="runtime-create-new-answer-wrapper">
                        Добавте свій варіант відповіді на запитання. Якщо цей варіант виграє або його відмітять, то він буде доступний далі в грі.
                        <textarea
                            value={newAnswerText}
                            onChange={this.onNewAnswerTextareaChange}
                        />

                        <GameButton onClick={this.onSaveNewAnswerClick}>
                            Добавити
                        </GameButton>
                    </div>
                </Modal>
            </div>
        )
    }
}