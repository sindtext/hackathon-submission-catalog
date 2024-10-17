// Import necessary modules
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import yaml from "js-yaml";
import _ from "lodash";

const cwdPath = process.cwd();

// Read command line arguments
const csvFilePath = process.argv[2];

// Read the template YAML file
const templateFilePath = path.join(cwdPath, "projects", ".template.yml");
const templateContent = fs.readFileSync(templateFilePath, "utf8");

// Process the CSV file
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on("data", (data) => {
    const {
      name,
      showcaseURL,
      tagline,
      teamGithubs,
      teamTwitters,
      sourceCodeUrl,
    } = data;

    // Generate the YAML file name
    const yamlFileName = `${_.kebabCase(name)}.yml`;

    // Clear the default fields in the template
    const templateData = yaml.load(templateContent);
    const emptyFields = function (data) {
      Object.keys(data).forEach((key) => {
        if (typeof data[key] === "number") {
          data[key] = 0;
        } else if (typeof data[key] === "boolean") {
          data[key] = false;
        } else if (typeof data[key] === "string") {
          data[key] = "";
        } else if (Array.isArray(data[key])) {
          data[key] = [];
        } else {
          data[key] = emptyFields(data[key]);
        }
      });
    };
    emptyFields(templateData);

    // Fill in the fields from the source data
    templateData.name = name;
    templateData.showcaseUrl = showcaseURL;
    templateData.sourceCodeUrl = sourceCodeUrl;

    // Fill in optional fields if they exist in the source data
    if (tagline) {
      templateData.tagline = tagline;
    }
    if (teamGithubs || teamTwitters) {
      const team = [];
      if (teamGithubs) {
        teamGithubs.split(",").forEach((github, i) => {
          if (!team[i]) {
            team[i] = {};
          }
          team[i] = { ...team[i], github: _.trim(github) };
        });
      }
      if (teamTwitters) {
        teamTwitters.split(",").forEach((twitter, i) => {
          if (!team[i]) {
            team[i] = {};
          }
          team[i] = { ...team[i], twitter: _.trim(twitter) };
        });
      }
      templateData.team = team;
    }

    // Convert the YAML data back to a string
    const yamlContent = yaml.dump(templateData);

    // Write the YAML file
    const yamlFilePath = path.join(cwdPath, "projects", yamlFileName);
    fs.writeFileSync(yamlFilePath, yamlContent);
  })
  .on("end", () => {
    console.log("YAML files generated successfully!");
  });
