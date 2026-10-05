import { GraphQLEnumType } from "graphql";

export const enum UserRole {
  ADMIN = "admin",
  USER = "user",
}
export const enum UserGender {
  MALE = "male",
  FEMALE = "female",
}
export const enum ProviderType {
  GOOGLE = "google",
  FACEBOOK = "facebook",
  SYSTEM = "system",
}

export const graphqlUserRole = new GraphQLEnumType({
  name: "UserRole",
  values: {
    ADMIN: { value: UserRole.ADMIN },
    USER: { value: UserRole.USER },
  },
});

export const graphqlUserGender = new GraphQLEnumType({
  name: "UserGender",
  values: {
    MALE: { value: UserGender.MALE },
    FEMALE: { value: UserGender.FEMALE },
  },
});

export const graphqlProviderType = new GraphQLEnumType({
  name: "ProviderType",
  values: {
    GOOGLE: { value: ProviderType.GOOGLE },
    FACEBOOK: { value: ProviderType.FACEBOOK },
    SYSTEM: { value: ProviderType.SYSTEM },
  },
});
