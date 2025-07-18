import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { Component, componentDefinitionMap } from "./components.js";

const defaultFormTemplate: { attributes: {}; children: Component[] } = {
  attributes: {},
  children: [],
};

const formExample = structuredClone(defaultFormTemplate);
formExample.children.push(
  {
    type: "label",
    attributes: {
      text: "Hello, World!",
    },
  },
  {
    type: "input",
    attributes: {
      placeholder: "Enter text",
      value: "",
    },
  },
  {
    type: "button",
    attributes: {
      text: "Click Me",
    },
  }
);

const documentationForComponentList =
  "## Example Form\n\n" +
  "```json\n" +
  JSON.stringify(formExample, null, 2) +
  "\n\n" +
  "```\n\n" +
  "## Supported Components\n\n" +
  Object.keys(componentDefinitionMap)
    .map((type) => {
      const component = componentDefinitionMap[type];
      return `- **${type}**: ${component.description}`;
    })
    .join("\n\n");

export async function startMcpServer(transport: StreamableHTTPServerTransport) {
  // Create server instance
  const server = new McpServer({
    name: "manipulate-form-json-schema",
    version: "1.0.0",
  });

  server.tool(
    "get-supported-components",
    "Returns a list of supported components",
    {},
    async ({}) => {
      return {
        content: [
          {
            type: "text",
            text: documentationForComponentList,
          },
        ],
      };
    }
  );

  // create a brand new form
  server.tool("create-form", "Creates a new form", {}, async ({}) => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(defaultFormTemplate),
          annotations: "This is a JSON data structure representing the form",
        },
      ],
    };
  });

  server.tool(
    "add-component",
    "Adds a component to the form",
    {
      form: z
        .string()
        .describe("JSON data structure of the form to add the component to"),
      type: z.string().describe("Type of component to add"),
    },
    async ({ form, type }) => {
      const formObject = JSON.parse(form);
      const component = structuredClone(componentDefinitionMap[type].template);
      (component as Component).type = type;
      formObject.children.push(component);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(formObject, null, 2),
            annotations: "This is a JSON data structure representing the form",
          },
        ],
      };
    }
  );

  // Start the server
  await server.connect(transport);
  return server
}
