import { gql } from 'apollo-server';

const typeDefs = gql`
  type Query {
    searchCity(name: String!): [City!]!
    getActivityRanking(city: String!): ActivityRanking!
  }

  type City {
    name: String!
    country: String
    latitude: Float!
    longitude: Float!
  }

  type DayScore {
    date: String!
    score: Float!
    reason: String
  }

  type ActivityScores {
    activity: String!
    daily: [DayScore!]!
    avgScore: Float!
  }

  type ActivityRanking {
    activities: [ActivityScores!]!
    ranking: [String!]!
  }
`;

export default typeDefs;
