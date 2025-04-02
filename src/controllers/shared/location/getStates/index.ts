import handleError from "@/utils/handleError";
import { Request, Response } from "express";
import * as rawData from "@/assets/json/nigeria_states_and_local_government_areas.json";
import handleSuccess from "@/utils/handleSuccess";
import { uniq } from "lodash";

const getStates = (req: Request, res: Response) => {
    try {
        const includeLGA = req.query.includeLGA === "true";
        let data = [] as any[];

        const statesAndLGAArray = Object.values(rawData as unknown as Record<string, { LGA: any; State: any }>).map(({ LGA, State }) => ({
            state: State,
            lga: LGA
        }));


        if (includeLGA) {
            const groupedStates = statesAndLGAArray.reduce((acc: Record<string, any>, { state, lga }) => {
                if (!acc[state]) {
                    acc[state] = { state, lga: [] };
                }
                acc[state].lga.push(lga);
                return acc;
            }
                , {});

            data = (Object.values(groupedStates) as { state: string; lga: any[] }[]).map((state) => ({
                state: state.state,
                lgas: includeLGA ? state.lga.map((lga: string) => lga) : undefined
            }));
        } else {
            data = uniq(Object.values(statesAndLGAArray.map(({ state }) => state)));
            data = data.filter((state) => state).sort((a, b) => a.localeCompare(b));
            data = data.map((state: string) => state.split(" ")[0]);
        }

        handleSuccess({
            res,
            message: "States retrieved successfully",
            data,
            code: 200
        });
    } catch (error) {
        handleError({
            error,
            res,
            message: "Failed to get states",
            code: 500
        });
    }
};

export default getStates;
