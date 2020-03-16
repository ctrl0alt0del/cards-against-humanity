import React from 'react';
import { CAHGameData, CAHSessionGameData, CAHTurnType } from '/imports/utils/Types';
import { QuestionReadState } from '../QuestionReadState/QuestionReadState.component';
import { AnswerList } from '../AnswerList/AnswerList.component';
import { PlayerType, GameSessionType } from '../../utils/Types';
import { CSSTransition } from 'react-transition-group';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { CAHTurnsCollection } from '/imports/api/CAHTurn/CAHTurn.collection';
import { PlayersStatusLine } from '../PlayerStatusLine/PlayersStatusLine.component';
import { GameButton } from '../Helpers/GameButton';
import { vibrate } from '/imports/utils/Common.utils';

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
        if (prevScore !== currScore) {
            vibrate(200);
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
        const jokersCount = player?.gameData?.jokersCount || 0;
        const currentTurnId = session?.sessionGameData.currentTurnId || null;
        const currentTurnData = turns && turns.find(t => t._id === currentTurnId);
        const isCurrentPlayerReader = currentTurnData && player ? currentTurnData.readerId === player?._id : false;
        let displayedContent;
        const questionId = currentTurnData?.questionId;
        const answersToQuestion = currentTurnData?.answers;
        if (isCurrentPlayerReader) {
            displayedContent = (
                <QuestionReadState
                    questionId={questionId}
                    players={players}
                    answers={answersToQuestion}
                    addNewQuestionAvailable={!currentTurnData?.newQuestionWasAdded}
                    forwardQuestionAvailable={!currentTurnData?.newQuestionWasAdded && !currentTurnData?.questionWasForwarded}
                />
            )
        } else {
            displayedContent = (
                <AnswerList
                    currentQuestionId={questionId}
                    answers={cards}
                    turn={currentTurnData}
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
                        <div id="joker-count-wrapper">
                            <i className="fas fa-mask"/>
                            x{jokersCount}
                        </div>
                    </div>
                </div>
                <div id="game-main-content">
                    {displayedContent}
                    <PlayersStatusLine players={players} turn={currentTurnData} turns={turns} />
                </div>
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