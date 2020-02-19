import React from "react";
import { QuestionCard } from "../QuestionCard/QuestionCard.component";
import { ImmediateCSSTransition } from "../Helpers/ImmediateCSSTransition.component";
import { PlayersInfo, DisplayPlayersInfoTypeEnum } from "../PlayersInfo/PlayersInfo.component";
import { PlayerData, AnswerSelectionType, PlayerType, CAHGameData, CAHTurnAnswersData } from '../../utils/Types';
import { AnswerCard } from '../AnswerCard/AnswerCard.component';
import ReactSwipe from 'react-swipe';
import { safeHandler } from '../../utils/Common.utils';
import { Meteor } from "meteor/meteor";

type QuestionReadStatePropsType = {
    questionId: string,
    players: PlayerType<CAHGameData>[],
    answers?: CAHTurnAnswersData[]
}

type QuestionReadStateStateType = {
}

const SwipeOptions = { continuous: false };

export class QuestionReadState extends React.Component<QuestionReadStatePropsType, QuestionReadStateStateType> {

    onSelectAnswerButtonClick(playerId: string) {
        Meteor.call("selectBestAnswerForCurrentQuestion", playerId, err => {
            if(err) {
                console.error(err);
            }
        })
    }

    render() {
        const { questionId, players, answers } = this.props;
        return (
            <div id="question-read-state-wrapper">
                <div id="read-question-wrapper">
                    <ImmediateCSSTransition timeout={500} classNames="question-wrapper">
                        <QuestionCard
                            questionId={questionId}
                        />
                    </ImmediateCSSTransition>
                </div>
                {
                    answers.length !== (players.length - 1) ? (
                        <div id="answering-status-line">
                            <PlayersInfo players={players} infoType={DisplayPlayersInfoTypeEnum.Answered} />
                        </div>
                    ) : (
                            <div id="answers-line">
                                <ReactSwipe swipeOptions={SwipeOptions}>
                                    {answers.map(answersData => {
                                        const playerId = answersData.playerId;
                                        return (
                                            <div className="answer-for-question-wrapper" key={`answer_${playerId}`}>
                                                <div className="answers-inline-wrapper">
                                                    {answersData.answersIdList.map(answerId => {
                                                        return (<AnswerCard
                                                            answerId={answerId}
                                                            disableDrag
                                                            key={`answer_${answerId}`}
                                                        />)
                                                    })}
                                                </div>
                                                <div className="select-best-answer-button-wrapper">
                                                    <div className="select-best-answer-button" onClick={() => this.onSelectAnswerButtonClick(playerId)}>
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