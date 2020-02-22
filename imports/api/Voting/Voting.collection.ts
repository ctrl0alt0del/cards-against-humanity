import { Mongo } from "meteor/mongo";
import { GeneralVotingType } from "/imports/utils/Types";

export const VotingCollection = new Mongo.Collection<GeneralVotingType>('voting');