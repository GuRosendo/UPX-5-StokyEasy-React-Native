import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getDistance = (c1, c2) => {
  const R = 6371e3;
  const lat1 = (c1.latitude * Math.PI) / 180;
  const lat2 = (c2.latitude * Math.PI) / 180;
  const dlat = lat2 - lat1;
  const dlon = ((c2.longitude - c1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const normalizeWeight = (w) => {
  if (!w) return 70;

  let clean = w.toString().replace(/\./g, "").replace(/,/g, "");
  const num = Number(clean);

  if (isNaN(num)) return 70;

  return num / 100;
};

TaskManager.defineTask("LOCATION_TRACKING", async ({ data, error }) => {
  if (error) {
    console.log("Erro na task:", error);
    return;
  }

  const { locations } = data;
  if (!locations || locations.length === 0) return;

  const loc = locations[0].coords;

  try {
    const last = await AsyncStorage.getItem("lastCoord");
    const lastCoord = last ? JSON.parse(last) : null;

    const progressData = await AsyncStorage.getItem("currentRun");
    let progress = progressData
      ? JSON.parse(progressData)
      : {
          distance: 0,
          calories: 0,
          co2: 420,
        };

    const userData = await AsyncStorage.getItem("userData");
    const user = userData ? JSON.parse(userData) : null;

    let weight = user ? normalizeWeight(user.weight) : 70;

    if (lastCoord) {
      const dist = getDistance(lastCoord, loc);

      progress.distance += dist;

      progress.calories = (progress.distance / 1000) * (weight * 0.78);

      progress.co2 = 400 + Math.floor(Math.random() * 30);
    }

    await AsyncStorage.setItem("lastCoord", JSON.stringify(loc));

    await AsyncStorage.setItem("currentRun", JSON.stringify(progress));

    console.log("Background location:", loc);
  } catch (err) {
    console.log("Erro na task LOCATION_TRACKING:", err);
  }
});

export default {};
