import { Mongo } from "meteor/mongo";
import { AnswerType } from "../../utils/Types";

export const AnswerCollection = new Mongo.Collection<AnswerType>('answers');