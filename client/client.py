import asyncio
import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from mcp_use import MCPAgent, MCPClient

# Load environment variables
load_dotenv()
MAX_TRUNCATED_RESULT_LENGTH = int(os.environ.get("MAX_RESULT_LENGTH_DISPLAYED", 100))

# Create MCPClient from configuration dictionary
# if ~/.config/mcp-client exists, use ~/.config/mcp-client/config.json
# otherwise use ./config.json
config_file_path = os.path.join(
    os.path.expanduser("~"), ".config", "mcp-client", "config.json"
)
if not os.path.exists(config_file_path):
    config_file_path = os.path.join("config.json")

client = MCPClient.from_config_file(config_file_path)

model_name = os.environ.get("MODEL_NAME", "gemini-2.5-flash")

# Create LLM
llm = init_chat_model(model_name, model_provider="google_genai")

# Create agent with the client
agent = MCPAgent(llm=llm, client=client, max_steps=30)


async def query():
    # Run the query
    # prompt = "Search for the latest Python news and summarize it"
    print("Enter your prompt (or press Enter to exit):")
    prompt = ""
    while True:
        line = input()
        if line == "":
            break
        prompt += line + "\n"
    if prompt == "":
        return True

    async for item in agent.stream(prompt.strip()):
        if isinstance(item, str):
            # Final result
            print(f"\n✅ Final Result:\n{item}")
            return False
        else:
            # Intermediate step (action, observation)
            action, observation = item
            print(f"\n🔧 Tool: {action.tool}")
            print(f"📝 Input: {action.tool_input}")
            print(
                f"📄 Result: {observation[:MAX_TRUNCATED_RESULT_LENGTH]}{'...' if len(observation) > MAX_TRUNCATED_RESULT_LENGTH else ''}"
            )
            # print(f"📄 Result: {observation}")


async def main():
    session_ended = False
    while not session_ended:
        session_ended = await query()
    print("\n🎉 Done!")


if __name__ == "__main__":
    asyncio.run(main())
