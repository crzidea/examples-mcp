# MCP Client
A client for interacting with the MCP (Meta Cognitive Processor) using the Langchain library and Google GenAI models.

## Table of Contents
. [Introduction](#introduction)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Configuration](#configuration)

## Introduction
This client provides a simple interface for querying the MCP and receiving intermediate and final results. It uses the Langchain library to interact with the Google GenAI models.

## Installation
To install the required dependencies, run the following command:
```bash
pip install -r requirements.txt
```
Make sure to create a `config.json` file in the root directory or `~/.config/mcp-client/` with the necessary configuration settings.

## Usage
To run the client, execute the following command:
```bash
python client.py
```
Enter your prompt when prompted, and the client will stream the intermediate and final results.

## Configuration
The client uses environment variables and a configuration file to set up the MCP client and Langchain model. The following environment variables are used:
* `MAX_TRUNCATED_RESULT_LENGTH`: The maximum length of the result to display (default: 100)
* `MODEL_NAME`: The name of the Langchain model to use (default: "gemini-2.5-flash")

The configuration file `config.json` should contain the necessary settings for the MCP client.