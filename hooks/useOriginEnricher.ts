// hooks/useOriginEnricher.ts
// import { TwitterAPI } from "@campnetwork/origin";

export const useOriginEnricher = () => {
    // Initialize APIs with API Key from Env
    // const twitter = new TwitterAPI({ apiKey: process.env.NEXT_PUBLIC_ORIGIN_API_KEY || '' }); 
    
    const enrichGuest = async (handle: string) => {
        try {
            // @ts-expect-error - origin is not typed correctly in our ecosystem for now
            // return await twitter.fetchUserByUsername(handle);
            console.log("Mocking Origin SDK fetchUserByUsername for", handle);
            return { name: handle, username: handle, profileImage: undefined };
        } catch (_err: unknown) {
            console.warn("Origin SDK: Could not fetch user", _err);
            return null;
        }
    };

    return { enrichGuest };
};
