document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');

  let conversationHistory = [];

  const addMessage = (role, message) => {
    const messageElement = document.createElement('div');
    // Di front-end kita bisa tetap pakai 'bot' untuk styling CSS jika mau,
    // tapi yang dikirim ke history harus 'model'.
    const displayRole = role === 'model' ? 'bot' : 'user';
    messageElement.className = `message ${displayRole}`;
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageElement;
  };

  chatForm.addEventListener('submit', async e => {
    e.preventDefault();

    const userMessage = userInput.value.trim();
    if (!userMessage) {
      return;
    }

    addMessage('user', userMessage);
    userInput.value = '';

    conversationHistory.push({ role: 'user', message: userMessage });

    // Saya ganti 'bot' menjadi 'model' saat memanggil addMessage untuk konsistensi
    const botThinkingMessage = addMessage('model', 'Thinking...');

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: conversationHistory,
        }),
      });

      if (!response.ok) {
        conversationHistory.pop();
        botThinkingMessage.textContent = 'Failed to get response from server.';
        return;
      }

      const result = await response.json();

      if (result.success && result.data) {
        const botResponse = result.data;
        botThinkingMessage.textContent = botResponse;

        // --- INI BAGIAN YANG DIPERBAIKI ---
        conversationHistory.push({ role: 'model', message: botResponse });
      } else {
        conversationHistory.pop();
        botThinkingMessage.textContent = 'Sorry, no response received.';
      }
    } catch (error) {
      console.error('Chat Error:', error);
      conversationHistory.pop();
      botThinkingMessage.textContent = 'Failed to get response from server.';
    }
  });
});
