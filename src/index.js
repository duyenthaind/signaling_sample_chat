const socket = io('http://168.138.178.183:8088');
const accessTokenInput = document.querySelector('#accessToken-input');
const userIdLabel = document.querySelector("#userId");
const userIdInput = document.querySelector("#userId-input");
const startButton = document.querySelector('#start-button');
const loginButton = document.querySelector("#auth-button");
const conversationIdInput = document.querySelector("#conversationId");
const messageBox = document.querySelector("#messageBox");
const messageInput = document.querySelector('#message-input');
const sendButton = document.querySelector("#send-button");

const sendEventPacketToServer = eventPacket => socket.emit('EventPacket', JSON.stringify(eventPacket));


const onAuth = async () => {
    let accessToken = accessTokenInput.value;
    let authBody = {
        "accessToken" : accessToken,
        "isForCall" : false
    }
    let eventPacket = genPacket(1, authBody);

    console.log(accessToken);
    sendEventPacketToServer(eventPacket);
}

const onAuthenticated = async(data) => {
    startButton.disabled = false;
    loginButton.disabled = true;
    let userId = data.user_id;
    let text = userId.fontcolor("green");
    console.log("Login with userId " + userId);
    userIdLabel.innerHTML = text;
}

const onCreateConversation = async () => {
    let packetBody = {
        "from" : userIdLabel.textContent,
        "to" : userIdInput.value
    }
    console.log(packetBody);
    let eventPacket = genPacket(7, packetBody);
    sendEventPacketToServer(eventPacket);
}

const onGetMessage = async() => {
    let conversationId = conversationIdInput.value;
    let packetBody = {
        "convId" : conversationId,
        "fromSeq" : 0,
        "amount" : 10
    }
    let eventPacket = genPacket(12, packetBody);
    sendEventPacketToServer(eventPacket);
}

const onSendMessage = async() => {
    let msg = messageInput.value;
    messageInput.innerHTML = '';
    let conversationId = conversationIdInput.value;
    let packetBody = {
        "convId" : conversationId,
        "body" : msg
    }
    let eventPacket = genPacket(9, packetBody);
    sendEventPacketToServer(eventPacket);
    messageInput.value = '';
    let htmlText = 'me : ' + msg;
    messageBox.value = messageBox.value + '\n' + htmlText;
}

const onPingEvent =  async(data) => {
    if(data.r == null){
        let eventPacket = genPacket(99, {"body" : null});
        sendEventPacketToServer(eventPacket);
    }
}

const onCreateConversationEvent = async (data) => {
    let r = data.r;
    let conversationId = data.conversation_id;
    // create conversation then join
    if(r === 0 && conversationId != null){
        conversationIdInput.value = conversationId;
        let packetBody = {
            "convId":conversationId
        }
        let eventPacket = genPacket(2, packetBody);
        sendEventPacketToServer(eventPacket);
    } else {
        alert('Create conversation fail ' + data.msg);
    }
}

const onJoinedConversationEvent = async (data) => {
    let r = data.r;
    if(r != 0){
        alert('Join conversation error ' + data.msg);
        return;
    }
    sendButton.disabled = false;
}

const onIncomingMessageEvent = async (data) => {
    let r = data.r;
    if(r == null){
        let msg = data.data;
        let body = msg.body;
        let fromUser = data.from_user;
        let htmlText = fromUser + ':' + body;
        messageBox.value = messageBox.value + '\n' + htmlText;
    }
}

const onEventPacketFromServer = async(data) => {
    let packet = JSON.parse(data)
    let service = packet.service;
    let body = packet.body;
    let jsonBody = JSON.parse(body);
    console.log(jsonBody);
    switch (service){
        case 1:
            await onAuthenticated(jsonBody);
            break;
        case 2:
            await onJoinedConversationEvent(jsonBody);
            break;
        case 7:
            await onCreateConversationEvent(jsonBody);
            break;
        case 9:
            await onIncomingMessageEvent(jsonBody);
            break;
        case 99:
            await onPingEvent(jsonBody);
            break;
        default:
            return;
    }
}

function genPacket(service, body){
    return {
        "service":service,
        "body": JSON.stringify(body)
    }
}

socket.on('EventPacket', onEventPacketFromServer);
socket.on('connect', data => {
    console.log("Connected, send a ping first");

    let eventPacket = {
        "service": 99,
        "body": null
    }

    socket.emit('EventPacket', JSON.stringify(eventPacket))
})

socket.on('disconnect', data => {
    let text = userIdLabel.textContent;
    let redText = text.fontcolor("red");
    userIdLabel.innerHTML = redText;
    loginButton.disabled = false;
    startButton.disabled = false;
    sendButton.disabled = true;
})