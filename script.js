// Wait for the entire page to load
document.addEventListener('DOMContentLoaded', function() {

    // --- Logic for Typing Animation ---
    const textElement = document.querySelector('.typing-text');
    if (textElement) {
        const textToType = "Frontend Developer";
        let index = 0;
        let isDeleting = false;

        function type() {
            const currentText = textToType.substring(0, index);
            textElement.textContent = currentText;

            if (!isDeleting && index < textToType.length) {
                index++;
                setTimeout(type, 150);
            } else if (isDeleting && index > 0) {
                index--;
                setTimeout(type, 100);
            } else {
                isDeleting = !isDeleting;
                setTimeout(type, 1200);
            }
        }
        type();
    }

    // --- Logic for AI Chat Assistant ---
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    if (chatBox && userInput && sendBtn) {
        async function handleSendMessage() {
            const question = userInput.value.trim();
            if (!question) return;

            addMessage(question, 'user');
            userInput.value = '';
            showLoadingIndicator();

            try {
                const response = await fetch('/ask', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question: question })
                });

                if (!response.ok) {
                    let serverError = 'An unknown server error occurred.';
                    try {
                        const errorData = await response.json();
                        serverError = errorData.error || `Server responded with status: ${response.status}`;
                    } catch (e) {
                        serverError = `Server error: ${response.statusText}`;
                    }
                    throw new Error(serverError);
                }

                const data = await response.json();
                removeLoadingIndicator();
                addMessage(data.answer, 'ai');

            } catch (error) {
                removeLoadingIndicator();
                addMessage(`Sorry, an error occurred: ${error.message}`, 'ai');
                console.error('Error:', error);
            }
        }

        function addMessage(text, sender) {
            const messageWrapper = document.createElement('div');
            messageWrapper.className = `message ${sender}-message`;

            const bubble = document.createElement('div');
            bubble.className = `message-bubble ${sender}-bubble`;

            if (sender === 'ai') {
                bubble.innerHTML = text;
                messageWrapper.appendChild(bubble);

                // Add copy button for AI messages
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-btn';
                copyBtn.innerHTML = '&#128203;';
                copyBtn.title = 'Copy text';
                copyBtn.onclick = () => {
                    const textToCopy = bubble.innerText;
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        copyBtn.innerHTML = '&#10004;';
                        setTimeout(() => { copyBtn.innerHTML = '&#128203;'; }, 1500);
                    });
                };
                messageWrapper.appendChild(copyBtn);
            } else {
                bubble.textContent = text;
                messageWrapper.appendChild(bubble);
            }

            chatBox.appendChild(messageWrapper);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        function showLoadingIndicator() {
            const indicator = document.createElement('div');
            indicator.className = 'message ai-message';
            indicator.innerHTML = `<div class="message-bubble ai-bubble loading-indicator"><span></span><span></span><span></span></div>`;
            chatBox.appendChild(indicator);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        function removeLoadingIndicator() {
            const indicator = chatBox.querySelector('.loading-indicator');
            if (indicator) indicator.parentElement.remove();
        }

        sendBtn.addEventListener('click', handleSendMessage);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSendMessage();
        });
    }
});
