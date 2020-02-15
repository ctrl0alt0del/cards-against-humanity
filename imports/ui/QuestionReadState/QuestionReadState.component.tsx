import React from "react";
import { QuestionCard } from "../QuestionCard/QuestionCard.component";
import { ImmediateCSSTransition } from "../Helpers/ImmediateCSSTransition.component";

type QuestionReadStatePropsType = {
    questionIndex: number
}

export class QuestionReadState extends React.Component<QuestionReadStatePropsType> {
    render() {
        const { questionIndex } = this.props;
        return (
            <div id="question-read-state-wrapper">
                <div id="read-question-wrapper">
                    <ImmediateCSSTransition timeout={500} classNames="question-wrapper">
                        <QuestionCard
                            questionIndex={questionIndex}
                        />
                    </ImmediateCSSTransition>
                </div>
            </div>
        )
    }
}