const { createApp, ref, onUnmounted, nextTick } = Vue;

createApp({
    setup() {
        const username = ref('');
        const inputUsername = ref('');
        const messages = ref([]);
        const currentMessage = ref('');
        const onlineUsers = ref([]);
        const showOnlineList = ref(false);
        const typingUsers = ref([]);
        const messagesDiv = ref(null);
        const messageInput = ref(null);
        const inputFocused = ref(false);
        
        let ws = null;
        let userAvatar = '';

        const generateAvatar = (name) => {
            const seed = name.toLowerCase().replace(/[^a-z0-9]/g, '');
            return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
        };

        const connectWebSocket = () => {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}`;
            
            ws = new WebSocket(wsUrl);
            
            ws.onopen = () => {
                userAvatar = generateAvatar(username.value);
                ws.send(JSON.stringify({
                    type: 'join',
                    username: username.value,
                    avatar: userAvatar
                }));
            };
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                
                switch (data.type) {
                    case 'message':
                        messages.value.push({
                            id: Date.now() + Math.random(),
                            sender: data.sender,
                            text: data.text,
                            timestamp: data.timestamp,
                            avatar: data.avatar
                        });
                        scrollToBottom();
                        break;
                        
                    case 'userList':
                        onlineUsers.value = data.users;
                        break;
                        
                    case 'typing':
                        if (!typingUsers.value.includes(data.username)) {
                            typingUsers.value.push(data.username);
                        }
                        setTimeout(() => {
                            const index = typingUsers.value.indexOf(data.username);
                            if (index > -1) {
                                typingUsers.value.splice(index, 1);
                            }
                        }, 3000);
                        break;
                }
            };
            
            ws.onclose = () => {
                setTimeout(() => {
                    if (username.value) {
                        connectWebSocket();
                    }
                }, 3000);
            };
        };

        const joinChat = () => {
            if (inputUsername.value.trim()) {
                username.value = inputUsername.value.trim();
                connectWebSocket();
            }
        };

        const sendMessage = () => {
            if (currentMessage.value.trim() && ws) {
                ws.send(JSON.stringify({
                    type: 'message',
                    text: currentMessage.value.trim(),
                    avatar: userAvatar
                }));
                currentMessage.value = '';
                nextTick(() => {
                    if (messageInput.value) {
                        messageInput.value.focus();
                    }
                });
            }
        };

        const handleTyping = () => {
            if (ws && currentMessage.value.trim()) {
                ws.send(JSON.stringify({ type: 'typing' }));
            }
        };

        const toggleOnlineList = () => {
            showOnlineList.value = !showOnlineList.value;
            if (showOnlineList.value && ws) {
                ws.send(JSON.stringify({ type: 'getUserList' }));
            }
        };

        const getTypingText = () => {
            const users = typingUsers.value.filter(user => user !== username.value);
            if (users.length === 0) return '';
            if (users.length === 1) return `${users[0]} is typing...`;
            return `${users.join(', ')} are typing...`;
        };

        const scrollToBottom = () => {
            nextTick(() => {
                if (messagesDiv.value) {
                    messagesDiv.value.scrollTop = messagesDiv.value.scrollHeight;
                }
            });
        };

        onUnmounted(() => {
            if (ws) {
                ws.close();
            }
        });

        return {
            username,
            inputUsername,
            messages,
            currentMessage,
            onlineUsers,
            showOnlineList,
            typingUsers,
            messagesDiv,
            messageInput,
            inputFocused,
            joinChat,
            sendMessage,
            handleTyping,
            toggleOnlineList,
            getTypingText
        };
    }
}).mount('#app');