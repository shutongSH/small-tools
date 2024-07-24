import * as yaml from "js-yaml";
import * as fs from "fs";
import { entries, map, pipe, reduce, toArray } from "@fxts/core";

type YamlObjet = {
  [key: string]: {
    displayName: {
      "zh-CN": string;
      "en-US": string;
    };
  };
};
type JsonObject = {
  "zh-CN": Record<string, string>;
  "en-US": Record<string, string>;
};
async function getYamlFile(): Promise<YamlObjet> {
  try {
    const doc = yaml.load(
      fs.readFileSync("script/yaml2json/source.yaml", "utf8")
    );
    return doc["messages"] as YamlObjet;
  } catch (e) {
    console.log("read error", e);
    throw e;
  }
}
function convertToJsonObject(yaml: YamlObjet): JsonObject {
  const arrayToObject = (a: Record<string, string>, b: [string, string]) => {
    a[b[0]] = b[1];
    return a;
  };
  const zhCNObject = pipe(
    yaml,
    entries,
    map((i) => [i[0], i[1].displayName["zh-CN"]]),
    toArray,
    (i) => reduce(arrayToObject, {}, i)
  );
  const enUSObject = pipe(
    yaml,
    entries,
    map((i) => [i[0], i[1].displayName["en-US"]]),
    toArray,
    (i) => reduce(arrayToObject, {}, i)
  );
  return {
    "zh-CN": zhCNObject,
    "en-US": enUSObject,
  };
}
async function yaml2json() {
  const yamlRes = await getYamlFile();
  const jsonRes = await convertToJsonObject(yamlRes);
  fs.writeFile(
    "script/yaml2json/target.json",
    JSON.stringify(jsonRes, null, 2),
    (error) => {
      if (error) {
        console.log("write error", error);
      } else {
        console.log("write success");
      }
    }
  );
}
yaml2json();
