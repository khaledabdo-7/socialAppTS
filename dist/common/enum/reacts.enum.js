"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactGraphQLType = exports.ReactType = void 0;
const graphql_1 = require("graphql");
var ReactType;
(function (ReactType) {
    ReactType["LIKE"] = "LIKE";
    ReactType["LOVE"] = "LOVE";
    ReactType["HAHA"] = "HAHA";
    ReactType["WOW"] = "WOW";
    ReactType["SAD"] = "SAD";
    ReactType["ANGRY"] = "ANGRY";
})(ReactType || (exports.ReactType = ReactType = {}));
exports.ReactGraphQLType = new graphql_1.GraphQLEnumType({
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
