import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import * as  packageJson from '../package.json' with { type: "json" };
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { stringify } from 'yaml'


// Read the image2yaml.md file
const rootPath = path.resolve(fileURLToPath(import.meta.url), '../../');

export async function startMcpServer(transport: StreamableHTTPServerTransport) {
  // Create server instance
  const server = new McpServer({
    name: packageJson.default.name,
    version: packageJson.default.version,
  });

  server.tool(
    "learn_fill_field_into_image",
    "Learn how to fill field value into image",
    {},
    async ({ }) => {
      const fillFieldValueIntoImage = await fs.readFile(path.resolve(rootPath, 'prompts/fill-field-value-into-image.md'), "utf8");

      return {
        content: [
          {
            type: "text",
            text: fillFieldValueIntoImage,
          },
        ],
      };
    }
  );
  server.tool(
    "get_example_field_values",
    "Get example field values",
    {},
    async ({ }) => {
      const exampleValues = {
        name: "于小龙",
        country: "中国",
        passport: "1234567890",
        birth_date: "1990-01-01",
        join_date: "2020-01-01",
        job_title: "软件工程师",
        salary_per_year_in_yuan: 100000,
        travel_start_date: "2025-01-01",
        travel_end_date: "2025-01-02",
        travel_country: "荷兰",
        manager_name: "姚劲波",
        manager_phone: "+8613800138000",
        date_today: "2025-08-01",
      }

      return {
        content: [
          {
            type: "text",
            text: stringify(exampleValues),
          },
        ],
      };
    }
  );

  server.tool(
    "save_example_html",
    "Save example HTML",
    {
      html: z.string(),
    },
    async ({ html }) => {
      await fs.writeFile(path.resolve(rootPath, 'output/example.html'), html);
      return {
        content: [
          {
            type: "text",
            text: "HTML saved",
          },
        ],
      };
    }
  );
  // Start the server
  await server.connect(transport);
  return server
}
