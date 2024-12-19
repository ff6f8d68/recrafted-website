exports.handler = async function(event, context) {
  if (event.httpMethod === 'POST') {
    // Get query parameters from the URL
    const { name, body, sender } = event.queryStringParameters || {};

    // Ensure that all required parameters are present
    if (!name || !body || !sender) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters: name, body, or sender' })
      };
    }

    const data = JSON.parse(event.body);

    // Your Discord webhook URL
    const discordWebhookUrl = 'https://discord.com/api/webhooks/1284559062859518014/kac428QnDZZlEnJxL-WSEvx1WOrNKjLPg4cNhKAL4xmkIjI4DkqJ0BlI-wi0YsXcn8ah';

    // Prepare the payload for Discord with the required format
    const payload = {
      content: `### ${name}\n${body}\n-# ${sender}\n\nType: ${data.Type}\nEmail: ${data.email}\nMessage: ${data.Report}`
    };

    // Send the message to Discord using native fetch
    try {
      await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to send report', details: error.message })
      };
    }

    // Redirect to the mailto link
    return {
      statusCode: 200,
      body: JSON.stringify({ error: 'success' })
      }
    };
  } else {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
};
