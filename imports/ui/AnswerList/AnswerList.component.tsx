import React from 'react';
import { AnswerCard } from '../AnswerCard/AnswerCard.component';
import { TransitionGroup, CSSTransition } from "react-transition-group"
import Draggable, { DraggableEvent } from 'react-draggable';
import { ImmediateCSSTransition } from '../Helpers/ImmediateCSSTransition.component';
import { Meteor } from 'meteor/meteor';
import { getQuestionById } from '/imports/utils/GameData.utils';
import { GameButton } from '../Helpers/GameButton';
import { CAHTurnType } from '../../utils/Types';
import { ClientPlayer } from '../../utils/ClientPlayerManager';

type AnswerListPropsType = {
    answers: string[],
    currentQuestionId: string,
    turn: CAHTurnType
}

type AnswerListStateType = {
    dropableAreaHighlighted: boolean,
    answerWasAccepted: boolean,
    selectedAnswers: string[],
    maxAnswersCount: number
}

export class AnswerList extends React.Component<AnswerListPropsType, AnswerListStateType> {
    state: AnswerListStateType = {
        dropableAreaHighlighted: false,
        answerWasAccepted: false,
        selectedAnswers: [],
        maxAnswersCount: 1
    }

    componentDidUpdate(prevProps: AnswerListPropsType) {
        if (this.props.currentQuestionId && prevProps.currentQuestionId !== this.props.currentQuestionId) {
            this.resolveMaxAnswersForCurrentQuestion();
        }
    }

    async resolveMaxAnswersForCurrentQuestion() {
        const currQId = this.props.currentQuestionId;
        this.setState({
            selectedAnswers: [],
            answerWasAccepted: false
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
        const isDraggedOverArea = this.isElementOverSelectableArea(draggableEl);
        if (isDraggedOverArea) {
            if (this.state.dropableAreaHighlighted !== true) {
                this.setState({
                    dropableAreaHighlighted: true
                });
            }
        } else if (this.state.dropableAreaHighlighted !== false) {
            this.setState({ dropableAreaHighlighted: false })
        }
    }

    onDropAnswerHandler(answerId: string, event: DraggableEvent) {
        if (this.state.selectedAnswers.length >= this.state.maxAnswersCount) {
            return false;
        } else {
            const draggableEl = event.target as HTMLElement;
            const isDraggedOverArea = this.isElementOverSelectableArea(draggableEl);
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
            selectedAnswers: []
        })
    }

    onAcceptAnswerButtonClick = () => {
        Meteor.call("selectAnswersForCurrentQuestion", this.state.selectedAnswers, err => {
            if (err) {
                console.error(err);
            }
        })
        this.setState({
            answerWasAccepted: true
        })
    }

    onAnswerSelected(answerId: string) {
        const prevSelectedAnswers = this.state.selectedAnswers;
        this.setState({
            selectedAnswers: prevSelectedAnswers.concat(answerId)
        })
    }

    private isElementOverSelectableArea(draggableEl: HTMLElement) {
        const boundingRect = draggableEl.getBoundingClientRect();
        const { top, height } = boundingRect;
        const isDraggedOverArea = (top + height) / window.innerHeight < 0.3;
        return isDraggedOverArea;
    }

    render() {
        const { answers, turn } = this.props;
        const me = ClientPlayer.me();
        const { dropableAreaHighlighted, answerWasAccepted, selectedAnswers, maxAnswersCount } = this.state;
        const selectedAnswerClass = selectedAnswers && selectedAnswers.length === maxAnswersCount ? 'selected' : (dropableAreaHighlighted ? 'highlighted' : '');
        const myAnswerInTurn = turn?.answers.some(answerData => answerData.playerId === me?._id) || false;
        return (
            <div id="answer-pick-state-wrapper">
                <div id="selected-answer-wrapper" className={selectedAnswerClass}>
                    {selectedAnswers && selectedAnswers.length > 0 ? (
                        selectedAnswers.map((answerIndex,i) => {
                            const contStyle: any = {};
                            const totalCount = selectedAnswers.length;
                            if(totalCount > 1) {
                                contStyle.left =  (75 / totalCount) * i+"%";
                            }
                            return (
                                <div className="select-answer-container" style={contStyle}>
                                    <AnswerCard disableDrag answerId={answerIndex} key={`selected_answer_${answerIndex}`} />
                                </div>
                            )
                        })
                    ) : (
                            <>Тягни сюди карточку, щоб вибрати відповідний варіант</>
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
                    {answers.map((answerId) => {
                        if (selectedAnswers.includes(answerId)) {
                            return;
                        }
                        return (
                            <ImmediateCSSTransition key={`answer_${answerId}`} classNames="game-card-anim" timeout={200}>
                                <div className="answer-card-super-wrapper">
                                    <AnswerCard
                                        answerId={answerId}
                                        onDrag={this.onDragAnswerHandler}
                                        onDrop={(ev) => this.onDropAnswerHandler(answerId, ev)}
                                    />
                                </div>
                            </ImmediateCSSTransition>
                        )
                    })}
                </TransitionGroup>
            </div>
        )
    }
}