import { groupBy, omit } from "lodash";

// Define an interface for the transformation object
interface Transformation {
    mergeField: string;
    childrenLabel: string;
    fieldsToKeep: string[];
}

/**
 * Nests tabular data based on a series of transformations, omitting specified fields.
 * @param results - The array of objects to nest
 * @param transformationsToApply - Array of transformation objects specifying how to nest the data
 * @param fieldsToOmit - Optional array of field names to exclude from the final result
 * @returns An array of nested objects
 */
const nest = (
    results: Record<string, any>[],
    transformationsToApply: Transformation[],
    fieldsToOmit: string[] = []
): Record<string, any>[] => {
    const transClone = [...transformationsToApply];
    const { mergeField, childrenLabel, fieldsToKeep } = transClone.shift() as Transformation;
    const groupedResult = groupBy(results, mergeField);
    fieldsToOmit.push(...fieldsToKeep, mergeField);

    return Object.entries(groupedResult).map(([key, value]) => {
        return {
            [mergeField]: key,
            ...fieldsToKeep.reduce((acc: Record<string, any>, keyToKeep: string) => {
                acc[keyToKeep] = value[0][keyToKeep];
                return acc;
            }, {}),
            [childrenLabel]: transClone.length
                ? nest(value, transClone, fieldsToOmit)
                : Object.values(value).map((v: Record<string, any>) => omit(v, fieldsToOmit))
        };
    });
};

export default nest;