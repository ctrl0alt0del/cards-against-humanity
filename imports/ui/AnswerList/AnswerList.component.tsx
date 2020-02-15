import React from 'react';
import { AnswerCard } from '../AnswerCard/AnswerCard.component';
import { TransitionGroup, CSSTransition } from "react-transition-group"

type AnswerListPropsType = {
    answerIndexies: number[]
}

export class AnswerList extends React.Component<AnswerListPropsType> {
    render() {
        const { answerIndexies } = this.props;
        return (
            <div id="answer-pick-state-wrapper">
                <TransitionGroup component="div" id="answer-pick-state-cards-list">
                    {answerIndexies.map((index) => {
                        return (
                            <CSSTransition key={`answer_${index}`} classNames="game-card-anim" timeout={200}>
                                <AnswerCard answerIndex={index} />
                            </CSSTransition>
                        )
                    })}
                </TransitionGroup>
            </div>
        )
    }
}