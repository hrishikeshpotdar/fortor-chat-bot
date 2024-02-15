import { LitElement, html, css } from 'lit';
import './MessageList.js';
import './InputArea.js';
import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

class ChatApp extends LitElement {

    static get properties() {
        return {
            messages: { type: Array },
            quotedMessage: { type: Object },
            user: { type: String },
        };
    }

    static get styles() {
        return css`
        .chat-container {
            max-width: 1200px;
            margin: 20px auto;
            display: flex;
            box-shadow: 0 2px 10px 0 rgba(0,0,0,0.2);
            border-radius: 10px;
            overflow: hidden;
            background: rgb(65 72 87);
          }

          .header {
            position: sticky;
            top: 0;
            background-color: rgb(65 72 87);
            color: white;
            border-radius: 5px;
            padding: 10px 15px;
            display: flex;
            flex-direction: column;
            align-items: left;
            gap: 10px;
            justify-content: space-between;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            z-index: 1;
          }
          
          .sidebar {
            width: 300px;
            background: rgb(65 72 87); /* subtle gray background */
            border-right: 1px solid #ddd;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            max-height: 75vh;
          }
          
          .sidebar .user {
            color: white;
            padding: 10px;
            border-bottom: 1px solid #eee;
            display: flex;
            align-items: center;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .sidebar .user:hover {
            background-color: #e9e9e9;
          }

          /* Responsive design */
@media (max-width: 600px) {
  .chat-container {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #ddd;
  }
}

            .blinking-dot {
                height: 10px;
                width: 10px;
                background-color: #76ff03;
                border-radius: 50%;
                display: inline-block;
                margin-left: 5px;
                animation: blink-animation 1.5s infinite;
              }
              
              @keyframes blink-animation {
                0% { opacity: 0; }
                50% { opacity: 1; }
                100% { opacity: 0; }
              }
        `

            ;
    }

    constructor() {
        super();
        this.socket = io('http://localhost:3000', {
            extraHeaders: {
                "Access-Control-Allow-Origin": "*"
            }
        });

        this.users = []; // Initialize the activeUsers array

        this.socket.on('active users', (users) => {
            console.log(users);
            this.users = users; // Update the activeUsers property with the incoming list
            this.requestUpdate(); // This is necessary to inform LitElement to process changes
        });


        this.messages = [];
        this.quotedMessage = null;
        this.isTyping = false;

        // Request messages

        this.getMessages();

        setInterval(() => this.getMessages(), 60000);


        this.socket.on('chat_messages', (msgs, user, avatar) => {
            this.messages = msgs;

            console.log(this.messages);

            this.user = user;
            this.avatar = avatar;
        });
    }

    _quoteMessage(e) {
        this.quotedMessage = e.detail;
    }

    getMessages() {
        this.socket.emit('get_messages');
    }

    svgElementFromString(str) {
        const div = document.createElement('DIV');
        div.innerHTML = str;
        const svg = div.querySelector('svg');
    
        if (!svg) {
          throw Error('<svg> tag not found');
        }
    
        return svg;
      }

    render() {
        return html`
      <div class="chat-container">

        <div class="sidebar">
        <div class="header">
        <div>Chat Bot App</div>
        <span>${this.user} (you)</span></span>
      </div>
                    ${this.users.map(user => html`
                        <div class="user">
                        ${this.svgElementFromString(user.avatar)}
                        <small>${user.userName} <span class="blinking-dot"></span> </small>
                        </div>
                    `)}
        </div>
        <div class="main-content">
        <message-list .messages="${this.messages}" .user=${this.user} @quote-message=${this._quoteMessage}></message-list>
        <input-area .quotedMessage=${this.quotedMessage} .user=${this.user} @send-message="${this.handleSendMessage}"></input-area>
        </div>
      </div>
    `;
    }

    handleSendMessage(e) {
        let message = e.detail;
        this.socket.emit('chat message', message); // send message to server
        this.quotedMessage = null;
        setTimeout(() => this.socket.emit('get_messages'), 1000)
        // Reset after sending
    }
}

customElements.define('chat-app', ChatApp);
