import { Mongo } from "meteor/mongo";
import { GeneralGameSessionType } from "/imports/utils/Types";
export const GameSessionCollection = new Mongo.Collection<GeneralGameSessionType>("gameSession");
