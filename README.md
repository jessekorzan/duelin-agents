
# 🥊 Duelin' Agents

A dual-agent chat interface that lets two AI agents have conversations with each other in real-time. Watch AI agents battle it out in head-to-head conversations!

## 🚀 Live Demo

Try it out now: **[https://dualin-agents.netlify.app/](https://dualin-agents.netlify.app/)**

## What is this?

Duelin' Agents is a web application that creates a split-screen chat interface where two AI agents can communicate with each other. You configure two different AI agents (like Claude, GPT-4, etc.) via webhooks, provide a starter prompt, and watch them have a conversation back and forth.

## Features

- **Dual Chat Interface**: Side-by-side chat windows showing both agents
- **Real-time Streaming**: Messages appear as they're being generated
- **Turn-based Conversation**: Agents take turns responding to each other
- **Configurable Agents**: Use any AI service that can respond via webhook
- **Visual Status Indicators**: Color-coded status showing thinking (red), waiting (orange), and active (green) states
- **Conversation Controls**: Pause, resume, and reset conversations
- **Responsive Design**: Works on desktop and mobile

## How it Works

1. **Setup Phase**: Configure two AI agents with their webhooks and names
2. **Starter Prompt**: Provide an initial prompt to begin the conversation
3. **Turn-based Chat**: The chosen starting agent responds first, then agents alternate
4. **Message Flow**: Each agent's response becomes the input for the next agent
5. **Visual Feedback**: Status indicators show which agent is thinking/active

## Usage

1. Open the application
2. Fill in the agent configuration:
   - **Agent Names**: Give your agents descriptive names
   - **Chat Webhooks**: URLs that will receive the conversation messages
   - **Image Webhooks**: (Optional) URLs for image processing - falls back to chat webhook if not provided
3. Set your **Starter Prompt**: The initial message that begins the conversation
4. Choose which agent starts first
5. Click **🚀 Start Battle** to begin the conversation

## Setting Up Webhooks with n8n

To use Duelin' Agents, you need to create webhook endpoints that can process chat messages and return AI responses. Here's how to set this up using n8n:

### Prerequisites

- Access to an n8n instance (cloud or self-hosted)
- API keys for your chosen AI services (OpenAI, Anthropic, etc.)

### Basic n8n Workflow Setup

1. **Create a new workflow** in n8n

2. **Add a Webhook node** as the trigger:
   - Set HTTP Method to `POST`
   - Set Response Mode to `Response to Webhook`
   - Note the webhook URL - this is what you'll use in Deulin' Agents

3. **Add an AI node** (choose your provider):
   - **For OpenAI**: Add "OpenAI" node
   - **For Anthropic Claude**: Add "HTTP Request" node with Anthropic API
   - **For other providers**: Use appropriate API nodes

4. **Configure the AI node**:
   - Set the model (gpt-4, claude-3, etc.)
   - Map the input: `{{ $json.chatInput }}`
   - Configure any system prompts or parameters

5. **Add a Response node**:
   - Set Response Data to the AI's output
   - For streaming responses, configure appropriate headers

### Example n8n Workflow Structure

```
Webhook Trigger
    ↓
[Optional] Set Variables (sessionId, etc.)
    ↓
AI Service Node (OpenAI/Claude/etc.)
    ↓
Respond to Webhook
```

### Expected Request Format

Your n8n webhook should expect this JSON structure:

```json
{
  "chatInput": "The message from the other agent",
  "action": "sendMessage",
  "sessionId": "unique-session-identifier"
}
```

### Expected Response Format

Your webhook should return the AI's response as plain text or JSON:

```json
{
  "data": "The AI agent's response message"
}
```

### Advanced Setup Tips

1. **System Prompts**: Give each agent a unique personality or role
2. **Memory Management**: Use sessionId to maintain conversation context
3. **Error Handling**: Add error nodes to handle API failures gracefully
4. **Rate Limiting**: Add delays if needed to prevent API rate limits
5. **Logging**: Add nodes to log conversations for debugging

### Example Agent Personas

- **Debate Agents**: One argues for, one argues against a topic
- **Creative Writing**: One starts a story, the other continues it
- **Problem Solving**: One poses problems, the other provides solutions
- **Interview Simulation**: One acts as interviewer, one as candidate

## Technical Details

- **Frontend**: Vanilla JavaScript with modular components
- **Styling**: CSS with custom properties and responsive design
- **Session Management**: Local storage for configuration persistence
- **Streaming**: Real-time message updates as they're generated
- **Error Handling**: Graceful fallbacks for network issues

## File Structure

```
src/
├── js/
│   ├── components/
│   │   └── dualAgent.js    # Main dual-agent logic
│   ├── core/
│   │   ├── session.js      # Session management
│   │   └── config.js       # Configuration constants
│   └── script.js           # Main entry point
├── css/
│   ├── components/
│   │   ├── chat.css        # Chat interface styles
│   │   └── setup.css       # Setup screen styles
│   └── style.css           # Main stylesheet
└── index.html              # Main HTML file
```

## Configuration Storage

The application automatically saves your agent configuration to browser localStorage, so you don't need to re-enter settings each time.

## Troubleshooting

- **Agents not responding**: Check webhook URLs and n8n workflow status
- **Messages not alternating**: Verify webhook response format
- **Status stuck on "Thinking"**: Check for webhook errors in browser developer tools
- **Configuration not saving**: Ensure localStorage is enabled in your browser

## Development

To modify or extend the application:

1. Edit the relevant component files in `src/js/components/`
2. Update styles in `src/css/components/`
3. Test with your n8n webhooks
4. The app uses a static web server - changes are reflected on page refresh

---

Built for exploring AI-to-AI communication patterns and creative conversation experiments.
