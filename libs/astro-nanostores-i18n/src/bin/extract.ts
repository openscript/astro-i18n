#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { createContext, runInContext } from "node:vm";
import { parse } from "@astrojs/compiler";
import { is, walk } from "@astrojs/compiler/utils";
import type { Messages } from "@nanostores/i18n";
import glob from "fast-glob";
import * as ts from "typescript";

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    identifier: {
      type: "string",
      default: "messages",
    },
    glob: {
      type: "string",
      default: "./src/**/*.astro",
    },
    out: {
      type: "string",
      default: "./src/translations/extract.json",
    },
    help: {
      type: "boolean",
      short: "h",
    },
  },
});

if (values.help) {
  // eslint-disable-next-line no-console
  console.log(`
Usage: extract-messages [options]

Options:
  --identifier <name> Variable name to extract messages from (default: "messages")
  --glob <pattern>    Glob pattern for finding Astro files (default: "./src/**/*.astro")
  --out <path>        Output path for messages file (default: "./src/translations/extract.json")
  --help, -h          Show this help message
  `);
  process.exit(0);
}

const components = await glob(values.glob, { absolute: true });
const allMessages: Record<string, Messages> = {};
const context = createContext({
  exports: {},
  Object,
  useI18n: (namespace: string, messages: Messages) => {
    allMessages[namespace] = { ...allMessages[namespace], ...messages };
    return messages;
  },
  params: (template: string) => template,
  count: (counts: Record<string, string>) => counts,
});

function extractMessagesFromAST(code: string) {
  const sourceFile = ts.createSourceFile("temp.ts", code, ts.ScriptTarget.Latest, true);

  let messagesExport: string | undefined;

  function visit(node: ts.Node) {
    if (ts.isVariableStatement(node)) {
      const declaration = node.declarationList.declarations[0];
      if (ts.isIdentifier(declaration.name) && declaration.name.text === values.identifier && declaration.initializer) {
        messagesExport = node.getText();
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return messagesExport;
}

await Promise.all(
  components.map(async (file) => {
    const content = await readFile(file, "utf-8");
    const { ast } = await parse(content, { position: false });

    walk(ast, (node) => {
      if (is.frontmatter(node)) {
        const { value: code } = node;

        try {
          const extractedMessages = extractMessagesFromAST(code);
          if (extractedMessages) {
            const code = ts.transpile(extractedMessages);
            runInContext(code, context);
          }
        } catch (error: unknown) {
          console.error(`Error processing file ${file}:`, error);
          process.exit(1);
        }
      }
    });
  })
);

if (Object.keys(allMessages).length > 0) {
  const messagesJSON = Object.fromEntries(Object.entries(allMessages).map(([namespace, messages]) => [namespace, messages]));

  await writeFile(values.out, JSON.stringify(messagesJSON, null, 2));
  process.exit(0);
} else {
  console.warn("No messages found in the provided components.");
}
