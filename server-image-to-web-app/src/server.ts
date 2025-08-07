import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import * as  packageJson from '../package.json' with { type: "json" };
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Read the image2yaml.md file
const rootPath = path.resolve(fileURLToPath(import.meta.url), '../../');

type Component = {
  name: string;
  type: string;
  [key: string]: any;
};

export async function startMcpServer(transport: StreamableHTTPServerTransport) {
  // Create server instance
  const server = new McpServer({
    name: packageJson.default.name,
    version: packageJson.default.version,
  });

  server.tool(
    "learn_image_to_webapp",
    "Learn how to convert web page image to webapp",
    {},
    async ({ }) => {
      const image2webapp = await fs.readFile(path.resolve(rootPath, 'prompts/image2webapp.md'), "utf8");

      return {
        content: [
          {
            type: "text",
            text: image2webapp,
          },
        ],
      };
    }
  );

  server.tool(
    "learn_image_to_yaml",
    "Learn how to convert web page image to yaml",
    {},
    async ({ }) => {
      const image2yaml = await fs.readFile(path.resolve(rootPath, 'prompts/image2yaml.md'), "utf8");

      return {
        content: [
          {
            type: "text",
            text: image2yaml,
          },
        ],
      };
    }
  );

  server.tool(
    "add_component",
    "Add a component to the web app JSON schema",
    {
      original_json: z.string().describe("The original JSON schema"),
      component_name: z.string().describe("The name of the component"),
      component_type: z.string().describe("The type of the component"),
      component_properties: z.record(z.string(), z.any()).describe("The properties of the component"),
    },
    async ({ original_json, component_name, component_type, component_properties }) => {
      const json = JSON.parse(original_json);
      if (!json.components) {
        json.components = [];
      }
      const component: Component = {
        name: component_name,
        type: component_type,
      };
      for (const property of Object.keys(component_properties)) {
        component[property] = component_properties[property];
      }
      json.components.push(component);
      return {
        content: [
          {
            type: "text",
            mimeType: "application/json",
            text: JSON.stringify(json, null, 2),
          },
        ],
      };
    }
  );

  // Start the server
  await server.connect(transport);
  return server
}
