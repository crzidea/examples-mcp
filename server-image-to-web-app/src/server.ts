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
  id: number;
  name: string;
  type: string;
  children?: Component[];
  children_template?: Component;
  [key: string]: any;
};

function findComponent(components: Component[], id: number): Component | null {
  for (const component of components) {
    if (component.id === id) {
      return component;
    }
    if (component.children) {
      const child = findComponent(component.children, id);
      if (child) {
        return child;
      }
    }
    if (component.children_template) {
      if (component.children_template.id === id) {
        return component.children_template;
      }
      if (component.children_template.children) {
        const child = findComponent(component.children_template.children, id);
        if (child) {
          return child;
        }
      }
    }
  }
  return null;
}

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
      component_parent: z.number().describe("The parent of the component").optional(),
      component_position: z.number().describe("The position of the component").optional(),
    },
    async ({ original_json, component_name, component_type, component_properties, component_parent, component_position }) => {
      const json = JSON.parse(original_json);
      if (!json.components) {
        json.components = [];
      }
      json.max_id = json.max_id || 0;
      json.max_id++;
      const component: Component = {
        id: json.max_id,
        name: component_name,
        type: component_type,
      };
      if (component_properties.children_template) {
        json.max_id++;
        component_properties.children_template.id = json.max_id;
      }
      for (const property of Object.keys(component_properties)) {
        component[property] = component_properties[property];
      }
      
      let container = json.components;
      if (component_parent) {
        const parent = findComponent(json.components, component_parent);
        if (parent) {
          parent.children = parent.children || [];
          container = parent.children;
        } else {
          throw new Error(`Parent component ${component_parent} not found`);
        }
      }

      if (component_position) {
        container.splice(component_position, 0, component);
      } else {
        container.push(component);
      }

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
