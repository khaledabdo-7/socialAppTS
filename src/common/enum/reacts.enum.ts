import { GraphQLEnumType } from "graphql";

export enum ReactType {
  LIKE = "LIKE",
  LOVE = "LOVE",
  HAHA = "HAHA",
  WOW = "WOW",
  SAD = "SAD",
  ANGRY = "ANGRY",
}


export const ReactGraphQLType = new GraphQLEnumType({
  name: "ReactType", 
  values: {
    LIKE: { value: ReactType.LIKE },
    LOVE: { value: ReactType.LOVE },
    HAHA: { value: ReactType.HAHA },
    WOW: { value: ReactType.WOW },
    SAD: { value: ReactType.SAD },
    ANGRY: { value: ReactType.ANGRY },
  },
});