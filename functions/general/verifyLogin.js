import { getSession } from "../shared/secureStorage";

export const VerifyLogin = async (setStoredData) => {
    const user = await getSession();
    setStoredData(user ?? null);
};