import React from "react";
import { QuestionCard } from "../QuestionCard/QuestionCard.component";
import { ImmediateCSSTransition } from "../Helpers/ImmediateCSSTransition.component";
import { PlayersInfo, DisplayPlayersInfoTypeEnum } from "../PlayersInfo/PlayersInfo.component";
import { PlayerData, AnswerSelectionType } from '../../utils/Types';
import { AnswerCard } from '../AnswerCard/AnswerCard.component';
import ReactSwipe from 'react-swipe';
import { safeHandler } from '../../utils/Common.utils';

type QuestionReadStatePropsType = {
    questionIndex: number,
    players: PlayerData[],
    answers?: AnswerSelectionType[]
    onBestAnswerSelected?: (selectionId: string) => void
}

type QuestionReadStateStateType = {
}

const SwipeOptions = { continuous: false };

export class QuestionReadState extends React.Component<QuestionReadStatePropsType, QuestionReadStateStateType> {
    state: QuestionReadStateStateType = {
        currentDisplayingAnswerIndex: null
    }

    render() {
        const { questionIndex, players, answers } = this.props;
        return (
            <div id="question-read-state-wrapper">
                <div id="read-question-wrapper">
                    <ImmediateCSSTransition timeout={500} classNames="question-wrapper">
                        <QuestionCard
                            questionIndex={questionIndex}
                        />
                    </ImmediateCSSTransition>
                </div>
                {
                    !answers ? (
                        <div id="answering-status-line">
                            <PlayersInfo players={players} infoType={DisplayPlayersInfoTypeEnum.Answered} />
                        </div>
                    ) : (
                            <div id="answers-line">
                                <ReactSwipe swipeOptions={SwipeOptions}>
                                    {answers.map(selectionData => {
                                        const selectionId = selectionData.selectionId;
                                        return (
                                            <div className="answer-for-question-wrapper" key={`answer_${selectionId}`}>
                                                <div className="answers-inline-wrapper">
                                                    {selectionData.answerIndexies.map(answerIndex => {
                                                        return (<AnswerCard
                                                            answerIndex={answerIndex}
                                                            disableDrag
                                                            key={`answer_${answerIndex}`}
                                                        />)
                                                    })}
                                                </div>
                                                <div className="select-best-answer-button-wrapper">
                                                    <div className="select-best-answer-button" onClick={() => safeHandler(this.props.onBestAnswerSelected)(selectionId)}>
                                                        Вибрати
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </ReactSwipe>
                            </div>
                        )
                }
            </div>
        )
    }
}