import { IResolvers } from '@graphql-tools/utils';
import { geocode, fetchWeather } from './weatherService';
import { computeActivityScores, DailyInput } from './scoring';

const resolvers: IResolvers = {
  Query: {
    async searchCity(_, { name }) {
      const results = await geocode(name);
      return results;
    },

    async getActivityRanking(_, { city }) {
      const geo = await geocode(city);
      if (!geo || geo.length === 0) {
        throw new Error('City not found');
      }
      const { latitude, longitude } = geo[0];
      const daily = await fetchWeather(latitude, longitude);

      const dates: string[] = daily.time || [];
      const tempMax: number[] = daily.temperature_2m_max || [];
      const precipitation: number[] = daily.precipitation_sum || [];
      const wind: number[] = daily.windspeed_10m_max || [];
      const snowfall: number[] = daily.snowfall_sum || [];

      // assemble a typed daily input array and delegate scoring to the scoring module
      const dailyInputs: DailyInput[] = dates.map((date: string, i: number) => ({
        date,
        tempMax: tempMax[i] ?? 0,
        precipitation: precipitation[i] ?? 0,
        windMax: wind[i] ?? 0,
        snowfall: snowfall[i] ?? 0,
      }))

      const activityScores = computeActivityScores(dailyInputs)

      const ranking = activityScores.slice().sort((a, b) => b.avgScore - a.avgScore).map(a => a.activity)

      return { activities: activityScores, ranking };
    },
  },
};

export default resolvers;
