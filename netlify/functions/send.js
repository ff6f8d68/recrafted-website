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
    const fetch = (await import('node-fetch')).default;

    // Your Discord webhook URL
    const discordWebhookUrl = 'https://discord.com/api/webhooks/1319341897927626822/a9wCm1HSgsy4PGUpALFo7Xal-T7Gw9eLFUaAb9Rx-VL2eOk0gWMNQllV2LhncKLyYeC8';

    // Prepare the payload for Discord with the required format
    const payload = {
      content: `### ${name}\n${body}\n-# ${sender}\n\nType: ${data.Type}\nEmail: ${data.email}\nMessage: ${data.Report}`
    };

    // Send the message to Discord
    try {
      await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to send report' })
      };
    }

    // Redirect to the mailto link
    return {
      statusCode: 302,
      headers: {
        Location: `mailto:nexusmcreports@proton.me?subject=Support%20Query&body=${encodeURIComponent(body)}`
      }
    };
  } else {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
};
