#!/usr/bin/env node

/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { existsSync, readdirSync, writeFileSync, statSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCRIPT_DIR = __dirname;
const MODULE_DIR = resolve(SCRIPT_DIR, "../../../../module");
const OUTPUT = resolve(SCRIPT_DIR, "../config.json");
const NAMESPACE = "sbemulatorns"; // must less than 12 characters
const LOGGING = "Console"; // Console or File

const DEFAULT_QUEUE_PROPERTIES = {
  DeadLetteringOnMessageExpiration: false,
  DefaultMessageTimeToLive: "PT1H",
  DuplicateDetectionHistoryTimeWindow: "PT20S",
  ForwardDeadLetteredMessagesTo: "",
  ForwardTo: "",
  LockDuration: "PT1M",
  MaxDeliveryCount: 3,
  RequiresDuplicateDetection: false,
  RequiresSession: false,
};

const DEFAULT_TOPIC_PROPERTIES = {
  DefaultMessageTimeToLive: "PT1H",
  DuplicateDetectionHistoryTimeWindow: "PT20S",
  RequiresDuplicateDetection: false,
};

const config = {
  UserConfig: {
    Logging: {
      Type: LOGGING,
    },
    Namespaces: [
      {
        Name: NAMESPACE,
        Queues: [],
        Topics: [],
      },
    ],
  },
};

function addEntities(entityType, items, seen, defaultProps) {
  const target = config.UserConfig.Namespaces[0][entityType];
  for (const name of items) {
    if (seen.has(name)) {
      console.warn(`\x1b[33m WARNING: Removed duplicate ${entityType} '${name}'\x1b[0m`);
    } else {
      seen.add(name);
      target.push({
        Name: name,
        Properties: { ...defaultProps },
      });
    }
  }
}

async function processModules() {
  const seenQueues = new Set();
  const seenTopics = new Set();
  const modules = readdirSync(MODULE_DIR);
  for (const moduleName of modules) {
    const sbDir = join(MODULE_DIR, moduleName, "func/serviceBus");
    if (!existsSync(sbDir) || !statSync(sbDir).isDirectory()) {
      continue;
    }
    const queueFile = join(sbDir, "queueNameList.js");
    if (existsSync(queueFile)) {
      try {
        // Use dynamic import for ES module
        const queuesModule = await import(queueFile + "?t=" + Date.now());
        const queues = Object.values(queuesModule.default || queuesModule);
        console.log(`Appending Queues from ${queueFile}`);
        addEntities("Queues", queues, seenQueues, DEFAULT_QUEUE_PROPERTIES);
      } catch (err) {
        console.error(`Failed to import ${queueFile}:`, err.message);
      }
    }
    // Topics are not used yet
    // const topicFile = join(sbDir, "topicNameList.js");
    // if (existsSync(topicFile)) {
    //   try {
    //     const topicsModule = await import(topicFile + '?t=' + Date.now());
    //     const topics = Object.values(topicsModule.default || topicsModule);
    //     console.log(`Appending Topics from ${topicFile}`);
    //     addEntities("Topics", topics, seenTopics, DEFAULT_TOPIC_PROPERTIES);
    //   } catch (err) {
    //     console.error(`Failed to import ${topicFile}:`, err.message);
    //   }
    // }
  }
}

(async function main() {
  console.log(`START: Generating ${OUTPUT}`);
  await processModules();
  writeFileSync(OUTPUT, JSON.stringify(config, null, 2), "utf-8");
  console.log(`SUCCESS: ${OUTPUT} generated!`);
})();
