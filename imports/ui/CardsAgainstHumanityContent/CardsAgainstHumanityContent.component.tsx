import React from 'react';
import { CAHGameData, CAHSessionGameData, CAHTurnType } from '/imports/utils/Types';
import { QuestionReadState } from '../QuestionReadState/QuestionReadState.component';
import { AnswerList } from '../AnswerList/AnswerList.component';
import { PlayerType, GameSessionType } from '../../utils/Types';
import { CSSTransition } from 'react-transition-group';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { CAHTurnsCollection } from '/imports/api/CAHTurn/CAHTurn.collection';

type CardsAgainstHumanityContentPropsType = {
    player: PlayerType<CAHGameData>,
    session: GameSessionType<CAHSessionGameData>,
    players: PlayerType<CAHGameData>[]
}

type CardsAgainstHumanityContentStateType = {
    playUpdateScoreAnim: boolean,
}


type CAHTrackerPropsType = {
    turns: CAHTurnType[];
};

class CardsAgainstHumanityContentPure extends React.Component<CardsAgainstHumanityContentPropsType & CAHTrackerPropsType, CardsAgainstHumanityContentStateType> {
    state: CardsAgainstHumanityContentStateType = {
        playUpdateScoreAnim: false
    }

    componentDidUpdate(prevProps: CardsAgainstHumanityContentPropsType) {
        const prevScore = prevProps.player?.gameData?.score || 0;
        const currScore = this.props.player?.gameData?.score || 0;
        if(prevScore !== currScore) {
            navigator.vibrate(200);
            this.setState({
                playUpdateScoreAnim: true
            })
        }
    }

    render() {
        const { playUpdateScoreAnim } = this.state;
        const { player, session, players, turns } = this.props;
        const cards = player?.gameData?.cardsOnHand || [];
        const gameScore = player?.gameData?.score || 0;
        const currentTurnId = session?.sessionGameData.currentTurnId || null;
        const currentTurnData = turns && turns.find(t => t._id === currentTurnId);
        const isCurrentPlayerReader = currentTurnData && player ? currentTurnData.readerId === player?._id : false;
        /*switch (gameState) {
            /*case GameState.QuestionRead:
                appContent = 
                break;
        }*/
        let displayedContent;
        const questionId = currentTurnData?.questionId;
        const answersToQuestion = currentTurnData?.answers;
        if (isCurrentPlayerReader) {
            displayedContent = (
                <QuestionReadState
                    questionId={questionId}
                    players={players}
                    answers={answersToQuestion}
                />
            )
        } else {
            displayedContent = (
                <AnswerList
                    currentQuestionId={questionId}
                    answers={cards}
                />
            )
        }
        return (
            <React.Fragment>
                <div id="app-status-line">
                    <div id="score-wrapper">
                        <CSSTransition in={playUpdateScoreAnim} classNames="score-update" timeout={300}>
                            <div id="score-card-icon">{gameScore}</div>
                        </CSSTransition>
                    </div>
                </div>
                {displayedContent}
            </React.Fragment>
        );
    }
}

export const CardsAgainstHumanityContent = withTracker<CAHTrackerPropsType, CardsAgainstHumanityContentPropsType>(props => {
    Meteor.subscribe("turns");
    const turns = CAHTurnsCollection.find({}).fetch();
    return {
        turns
    }
})(CardsAgainstHumanityContentPure);