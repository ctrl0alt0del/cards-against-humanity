import { Mongo } from 'meteor/mongo';
import { PlayerType, GameData } from '/imports/utils/Types';
export const PlayerCollection = new Mongo.Collection<PlayerType<GameData>>('players');
