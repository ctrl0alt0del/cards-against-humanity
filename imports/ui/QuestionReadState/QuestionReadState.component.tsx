import React from "react";
import { QuestionCard } from "../QuestionCard/QuestionCard.component";
import { ImmediateCSSTransition } from "../Helpers/ImmediateCSSTransition.component";
import { PlayersInfo, DisplayPlayersInfoTypeEnum } from "../PlayersInfo/PlayersInfo.component";
import { PlayerType, CAHGameData, CAHTurnAnswersData } from '../../utils/Types';
import { AnswerCard } from '../AnswerCard/AnswerCard.component';
import ReactSwipe from 'react-swipe';
import { Meteor } from "meteor/meteor";
import { GameButton } from '../Helpers/GameButton';
import { meteorCall, vibrate } from "/imports/utils/Common.utils";

type QuestionReadStatePropsType = {
    questionId: string,
    players: PlayerType<CAHGameData>[],
    answers?: CAHTurnAnswersData[]
}

type QuestionReadStateStateType = {
}

const SwipeOptions = { continuous: false };

export class QuestionReadState extends React.Component<QuestionReadStatePropsType, QuestionReadStateStateType> {

    private preventMultipleClickOnSelectButton = false;

    onSelectAnswerButtonClick(playerId: string) {
        if(this.preventMultipleClickOnSelectButton) {
            return;
        }
        this.preventMultipleClickOnSelectButton = true;
        setTimeout(()=>{
            this.preventMultipleClickOnSelectButton = false;
        }, 2000)
        return meteorCall("selectBestAnswerForCurrentQuestion", playerId)
    }

    componentDidUpdate(prevProps: QuestionReadStatePropsType) {
        const prevAnsweredAll = prevProps.answers.length === (prevProps.players.length - 1);
        const currAnsweredAll = this.props.answers.length === (this.props.players.length - 1);
        if (!prevAnsweredAll && currAnsweredAll) {
            vibrate(200);
        }
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
                                                        return (
                                                            <AnswerCard
                                                                answerId={answerId}
                                                                disableDrag
                                                                key={`answer_${answerId}`}
                                                                canLikeJocker
                                                            />
                                                        )
                                                    })}
                                                    
                                                </div>
                                                <div className="select-best-answer-button-wrapper">
                                                    <GameButton onClick={() => this.onSelectAnswerButtonClick(playerId)}>
                                                        Вибрати
                                                    </GameButton>
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