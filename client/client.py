import asyncio
import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from mcp_use import MCPAgent, MCPClient

# Load environment variables
load_dotenv()

# Create MCPClient from configuration dictionary
client = MCPClient.from_config_file(
    os.path.join("config.json")
)

# Create LLM
llm = init_chat_model("gemini-2.5-pro", model_provider="google_genai")

# Create agent with the client
agent = MCPAgent(llm=llm, client=client, max_steps=30)


async def query():
    # Run the query
    # prompt = "Search for the latest Python news and summarize it"
    print("Enter your prompt (or press Enter to exit):")
    prompt = input()
    if prompt == "":
        return
    
    async for item in agent.stream(prompt):
        if isinstance(item, str):
            # Final result
            print(f"\n✅ Final Result:\n{item}")
            await query()
        else:
            # Intermediate step (action, observation)
            action, observation = item
            print(f"\n🔧 Tool: {action.tool}")
            print(f"📝 Input: {action.tool_input}")
            print(f"📄 Result: {observation[:100]}{'...' if len(observation) > 100 else ''}")
    

async def main():
    await query()
    print("\n🎉 Done!")

if __name__ == "__main__":
    asyncio.run(main())