import React from 'react';
import { AnswerCard } from '../AnswerCard/AnswerCard.component';
import { TransitionGroup, CSSTransition } from "react-transition-group"
import Draggable, { DraggableEvent } from 'react-draggable';
import { ImmediateCSSTransition } from '../Helpers/ImmediateCSSTransition.component';
import { Meteor } from 'meteor/meteor';
import { getQuestionById } from '/imports/utils/GameData.utils';

type AnswerListPropsType = {
    answers: string[],
    currentQuestionId: string
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
        if(this.props.currentQuestionId && prevProps.currentQuestionId !== this.props.currentQuestionId) {
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
        if(qData) {
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
            return;
        } else {
            const draggableEl = event.target as HTMLElement;
            const isDraggedOverArea = this.isElementOverSelectableArea(draggableEl);
            if (isDraggedOverArea) {
                this.setState({
                    dropableAreaHighlighted: false
                })
                this.onAnswerSelected(answerId);
            }
        }

    }

    onResetAnswerListButtonClick = () => {
        this.setState({
            selectedAnswers: []
        })
    }

    onAcceptAnswerButtonClick = () => {
        Meteor.call("selectAnswersForCurrentQuestion", this.state.selectedAnswers, err => {
            if(err) {
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
        const isDraggedOverArea = (top + height) / window.innerHeight < 0.4;
        return isDraggedOverArea;
    }

    render() {
        const { answers } = this.props;
        const { dropableAreaHighlighted, answerWasAccepted,selectedAnswers, maxAnswersCount } = this.state;
        const selectedAnswerClass = selectedAnswers && selectedAnswers.length === maxAnswersCount ? 'selected' : (dropableAreaHighlighted ? 'highlighted' : '');
        return (
            <div id="answer-pick-state-wrapper">
                <div id="selected-answer-wrapper" className={selectedAnswerClass}>
                    {selectedAnswers && selectedAnswers.length > 0 ? (
                        selectedAnswers.map(answerIndex => {
                            return <AnswerCard disableDrag answerId={answerIndex} key={`selected_answer_${answerIndex}`} />
                        })
                    ) : (
                            <>Тягни сюди карточку, щоб вибрати відповідний варіант</>
                        )}
                </div>
                <div id="select-answer-control-buttons">
                    <div id="reset-button" onClick={this.onResetAnswerListButtonClick}>
                        Reset
                    </div>
                    {selectedAnswers.length === maxAnswersCount && !answerWasAccepted && (
                        <div id="accept-button" onClick={this.onAcceptAnswerButtonClick}>
                            Accept
                        </div>
                    )}
                </div>
                <TransitionGroup component="div" id="answer-pick-state-cards-list">
                    {answers.map((answerId) => {
                        if(selectedAnswers.includes(answerId)) {
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