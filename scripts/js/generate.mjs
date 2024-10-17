import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { json } from "stream/consumers";

const cwdPath = process.cwd();

// Read the template file
const templateFilePath = path.join(cwdPath, "projects", ".template.yml");
const template = readYamlFile(templateFilePath);

// Read all yaml files in the projects directory
const projectFiles = readDirectory("projects", [".template.yml"]);

// Initialize an empty array to store the merged configurations
const merged = [];

// Loop through each project file
for (const file of projectFiles) {
  // Read the yaml file
  const projectConfig = readYamlFile(file);

  // Check if the project config is valid
  const validKeys = Object.keys(template);
  // Filter out keys that are not in the template
  const filteredKeys = Object.keys(projectConfig).filter(
    (key) => !validKeys.includes(key)
  );
  // remove the invalid keys
  for (const key of filteredKeys) {
    delete projectConfig[key];
  }
  // push the project config to the merged array
  merged.push(projectConfig);
}

// sort the merged array by name
merged.sort((a, b) => a.name.localeCompare(b.name));

// Generate the submissions.json file in the outputs directory
writeJsonFile("outputs/submissions.json", merged);

// Read the template file
function readYamlFile(filePath) {
  const templateContent = fs.readFileSync(filePath, "utf8");
  return yaml.load(templateContent);
}

function readDirectory(directory, excludes = []) {
  const directoryPath = path.join(cwdPath, directory);
  // Read all files in the directory
  const files = fs.readdirSync(directoryPath);
  return files
    .filter((file) => !excludes.includes(file))
    .map((file) => path.join(directoryPath, file));
}

function writeJsonFile(fileName, data) {
  // Write the data to the file
  const fileToWrite = path.join(cwdPath, fileName);
  fs.writeFileSync(fileToWrite, JSON.stringify(data, null, 2));
}
