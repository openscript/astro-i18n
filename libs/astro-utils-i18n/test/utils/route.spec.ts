import { describe, expect, it } from "vitest";
import { buildPath, parseRoutePattern } from "../../src/astro-utils-i18n";

describe("parseRoutePattern", () => {
  it("should parse a static route pattern", () => {
    const result = parseRoutePattern("/blog/post");
    expect(result).toEqual([
      { spread: false, param: false, value: "blog" },
      { spread: false, param: false, value: "post" },
    ]);
  });

  it("should parse a dynamic route pattern", () => {
    const result = parseRoutePattern("/blog/[slug]");
    expect(result).toEqual([
      { spread: false, param: false, value: "blog" },
      { spread: false, param: true, value: "slug" },
    ]);
  });

  it("should parse a spread route pattern", () => {
    const result = parseRoutePattern("/[...locale]/blog/[slug]");
    expect(result).toEqual([
      { spread: true, param: true, value: "locale" },
      { spread: false, param: false, value: "blog" },
      { spread: false, param: true, value: "slug" },
    ]);
  });

  it("should parse a route pattern with trailing slash", () => {
    const result = parseRoutePattern("/blog/post/");
    expect(result).toEqual([
      { spread: false, param: false, value: "blog" },
      { spread: false, param: false, value: "post" },
    ]);
  });

  it("should parse a route pattern with only a slash", () => {
    const result = parseRoutePattern("/");
    expect(result).toEqual([{ spread: false, param: false, value: "/" }]);
  });
});

describe("buildPath", () => {
  it("should throw if no segment matches a param", () => {
    const routePattern = parseRoutePattern("/blog/[slug]");
    expect(() => buildPath(routePattern, { slug: undefined }, "/")).toThrowErrorMatchingSnapshot();
  });
  it("should throw if is filled with a path and param is not spread", () => {
    const routePattern = parseRoutePattern("/blog/[slug]");
    expect(() => buildPath(routePattern, { slug: "bli/bla/blub" }, "/")).toThrowErrorMatchingSnapshot();
  });
  it("should build valid paths", () => {
    const routePattern = parseRoutePattern("/blog/[...slug]/comments/[commentId]");
    expect(buildPath(routePattern, { slug: "bli/bla/blub", commentId: "2" }, "/")).toMatchSnapshot();
  });
});
