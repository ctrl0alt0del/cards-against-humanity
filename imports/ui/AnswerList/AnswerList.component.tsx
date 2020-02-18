import React from 'react';
import { AnswerCard } from '../AnswerCard/AnswerCard.component';
import { TransitionGroup, CSSTransition } from "react-transition-group"
import Draggable, { DraggableEvent } from 'react-draggable';

type AnswerListPropsType = {
    answerIndexies: number[],
    selectedAnswers: number[],
    maxAnswersCount: number
    onAnswerSelected: (answerIndex: number) => void
    onResetAnswersList: () => void,
    onAcceptAnswers: () => void
}

type AnswerListStateType = {
    dropableAreaHighlighted: boolean,
    shakeX: number,
    shakeY: number,
    answerWasAccepted: boolean
}

export class AnswerList extends React.Component<AnswerListPropsType, AnswerListStateType> {

    state: AnswerListStateType = {
        dropableAreaHighlighted: false,
        shakeX: 0,
        shakeY: 0,
        answerWasAccepted: false
    }

    componentDidUpdate(prevProps: AnswerListPropsType) {
        if(prevProps.selectedAnswers.length !== this.props.selectedAnswers.length) {
            this.setState({
                answerWasAccepted: false
            })
        }
    }

    onDragAnswerHandler = (event: MouseEvent) => {
        if (this.props.selectedAnswers.length >= this.props.maxAnswersCount) {
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

    onDropAnswerHandler(answerIndex: number, event: DraggableEvent) {
        if (this.props.selectedAnswers.length >= this.props.maxAnswersCount) {
            return;
        } else {
            const draggableEl = event.target as HTMLElement;
            const isDraggedOverArea = this.isElementOverSelectableArea(draggableEl);
            if (isDraggedOverArea) {
                this.setState({
                    dropableAreaHighlighted: false
                })
                this.props.onAnswerSelected(answerIndex);
            }
        }

    }

    private isElementOverSelectableArea(draggableEl: HTMLElement) {
        const boundingRect = draggableEl.getBoundingClientRect();
        const { top, height } = boundingRect;
        const isDraggedOverArea = (top + height) / window.innerHeight < 0.4;
        return isDraggedOverArea;
    }

    render() {
        const { answerIndexies, selectedAnswers, maxAnswersCount, onResetAnswersList, onAcceptAnswers } = this.props;
        const { dropableAreaHighlighted, shakeX, shakeY, answerWasAccepted } = this.state;
        const selectedAnswerClass = selectedAnswers && selectedAnswers.length === maxAnswersCount ? 'selected' : (dropableAreaHighlighted ? 'highlighted' : '');
        return (
            <div id="answer-pick-state-wrapper">
                <div id="selected-answer-wrapper" className={selectedAnswerClass}>
                    {selectedAnswers && selectedAnswers.length > 0 ? (
                        selectedAnswers.map(answerIndex => {
                            return <AnswerCard disableDrag answerIndex={answerIndex} key={`selected_answer_${answerIndex}`} />
                        })
                    ) : (
                            <>Тягни сюди карточку, щоб вибрати відповідний варіант</>
                        )}
                </div>
                <div id="select-answer-control-buttons">
                    <div id="reset-button" onClick={onResetAnswersList}>
                        Reset
                    </div>
                    {selectedAnswers.length === maxAnswersCount && !answerWasAccepted && (
                        <div id="accept-button" onClick={()=>{
                            this.setState({
                                answerWasAccepted: true
                            })
                            onAcceptAnswers()
                        }}>
                            Accept
                        </div>
                    )}
                </div>
                <TransitionGroup component="div" id="answer-pick-state-cards-list" style={{ transform: `translate(${shakeX}px, ${shakeY}px)` }}>
                    {answerIndexies.map((index) => {
                        return (
                            <CSSTransition key={`answer_${index}`} classNames="game-card-anim" timeout={200}>
                                <div className="answer-card-super-wrapper">
                                    <AnswerCard
                                        answerIndex={index}
                                        onDrag={this.onDragAnswerHandler}
                                        onDrop={(ev) => this.onDropAnswerHandler(index, ev)}
                                    />
                                </div>
                            </CSSTransition>
                        )
                    })}
                </TransitionGroup>
            </div>
        )
    }
}