import { describe, expect, it } from "vitest";
import { getAllUniqueKeys, pruneLocales } from "../../src/astro-utils-i18n";

describe("getAllUniqueKeys", () => {
  it("should return all unique keys of an object", () => {
    const result = getAllUniqueKeys({
      a: {
        b: {
          c: 1,
          d: 2,
        },
        e: 3,
      },
      b: 4,
      g: {
        a: 5,
        i: {
          c: 6,
          k: 7,
        },
      },
    });
    expect(result).toMatchSnapshot();
  });

  it("should return all unique keys of an object nested in an array", () => {
    const result = getAllUniqueKeys({
      a: [
        {
          z: 1,
          y: {
            de: 2,
            en: 3,
          },
        },
        {
          z: 4,
          y: {
            de: 5,
            en: 6,
          },
        },
      ],
    });
    expect(result).toMatchSnapshot();
  });

  it("should return all unique keys of an object with arrays in arrays", () => {
    const result = getAllUniqueKeys({
      a: [
        [
          {
            z: 1,
            y: [
              {
                de: 2,
                en: 3,
              },
              {
                de: 4,
                en: 5,
              },
            ],
          },
        ],
        [
          {
            z: 6,
            y: [
              {
                de: 7,
                en: 8,
              },
              {
                de: 9,
                en: 10,
              },
            ],
          },
        ],
      ],
    });
    expect(result).toMatchSnapshot();
  });
});

describe("pruneLocales", () => {
  it("should prune locales with top level locale data as objects", () => {
    const result = () => {
      pruneLocales(
        {
          en: { a: 1, b: 2 },
          fr: { a: 3, b: 4 },
          de: { a: 5, b: 6 },
        },
        ["en", "fr", "de"],
        "en"
      );
    };
    expect(result).toThrowErrorMatchingSnapshot();
  });
  it("should prune locales with top level local data as strings", () => {
    const result = () => {
      pruneLocales(
        {
          en: "Hello",
          fr: "Bonjour",
          de: "Hallo",
        },
        ["en", "fr", "de"],
        "en"
      );
    };
    expect(result).toThrowErrorMatchingSnapshot();
  });
  it("should prune locales with no data", () => {
    const result = pruneLocales({}, ["en", "fr", "de"], "en");
    expect(result).toMatchSnapshot();
  });
  it("should prune locales with nested data", () => {
    const result = pruneLocales(
      {
        title: { en: "Title", fr: "Titre", de: "Titel" },
        nestedObject: {
          en: { a: 7, b: 8 },
          fr: { a: 9, b: 10 },
          de: { a: 11, b: 12 },
        },
        nestedArray: {
          en: [
            { a: 13, b: 14 },
            { a: 15, b: 16 },
          ],
          fr: [
            { a: 17, b: 18 },
            { a: 19, b: 20 },
          ],
          de: [
            { a: 21, b: 22 },
            { a: 23, b: 24 },
          ],
        },
        nestedArrayWithObjects: [
          {
            en: { a: 25, b: 26 },
            fr: { a: 27, b: 28 },
            de: { a: 29, b: 30 },
          },
          {
            en: { a: 31, b: 32 },
            fr: { a: 33, b: 34 },
            de: { a: 35, b: 36 },
          },
        ],
        string: "normal string",
        number: 123,
        boolean: true,
        array: [1, 2, 3],
        object: { a: 1, b: 2 },
      },
      ["en", "fr", "de"],
      "en"
    );
    expect(result).toMatchSnapshot();
  });
});
