import { resolvePath } from "./path";

type Segments = Record<string, string | undefined>;
export type SegmentTranslations = Record<string, Segments>;
type RouteSegment = {
  spread: boolean;
  param: boolean;
  value: string;
};
type RoutePattern = RouteSegment[];

/**
 * Parses a route pattern into an array of route segments.
 *
 * @param routePattern is a string that templates the a route (e.g. /[...locale]/blog/[slug])
 */
export function parseRoutePattern(routePattern: string): RoutePattern {
  const segments = routePattern
    .split("/")
    .filter((segment) => segment !== "")
    .map((segment) => {
      if (segment.startsWith("[") && segment.endsWith("]")) {
        return {
          spread: segment.startsWith("[..."),
          param: true,
          value: segment.replace("[", "").replace("...", "").replace("]", ""),
        };
      }

      return {
        spread: false,
        param: false,
        value: segment,
      };
    });

  if (segments.length === 0) {
    return [{ spread: false, param: false, value: "/" }];
  }

  return segments;
}

/**
 * Constructs a full path by resolving a base path with a route pattern and corresponding segment values.
 *
 * @param routePattern - An array of route segments that define the structure of the route.
 *                        Each segment can either be a static value or a parameter.
 * @param segmentValues - An object mapping parameter names to their corresponding values.
 *                        These values are used to replace parameterized segments in the route pattern.
 * @param basePath - The base path to resolve the constructed route against.
 *
 * @returns The resolved path as a string.
 *
 * @throws {Error} If a required segment value for a parameterized route segment is missing
 *                 and the segment is not marked as a spread segment.
 */
export function buildPath(routePattern: RoutePattern, segmentValues: Segments, basePath: string) {
  return resolvePath(
    basePath,
    ...routePattern.map((segment) => {
      if (segment.param) {
        if (!segmentValues[segment.value] && !segment.spread) {
          throw new Error(`No segment value found for route segment "${segment.value}". Did you forget to provide it?`);
        }
        if (segmentValues[segment.value]?.includes("/") && !segment.spread) {
          throw new Error(
            `The segment value "${segmentValues[segment.value]}" for route segment "${segment.value}" contains a slash. Did you forget to add "..." to the route pattern?`
          );
        }

        return segmentValues[segment.value];
      }

      return segmentValues[segment.value] ?? `${segment.value}`;
    })
  );
}
