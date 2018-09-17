$(function () {
    const socket = io('http://localhost:3000/');
    const localVideo = document.querySelector('#localVideo');
    const startVideo = document.querySelector('#startVideo');
    var localMediaStream = null;
    var peerConnection = null;

    startVideo.addEventListener('click', () => {
        getLocalMedia();
    });

    function getLocalMedia() {
        const contraints = {
            video: false,
            audio: true
        };
        navigator.mediaDevices.getUserMedia(contraints)
            .then(gotLocalMediaStream)
            .catch();
    };

    function gotLocalMediaStream(mediaStream) {
        localVideo.srcObject = mediaStream;
        localMediaStream = mediaStream;
        //listLocalDevice(localMediaStream);
        createPeerConnection();
        localMediaStream.getTracks().forEach(track => peerConnection.addTrack(track, mediaStream));
    };

    function createPeerConnection() {
        peerConnection = new RTCPeerConnection({
            iceServers: [     // Information about ICE servers - Use your own!
                {
                    urls: "stun:stun.stunprotocol.org"
                }
            ]
        });
        peerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
    };

    function handleNegotiationNeededEvent() {
        console.log("create offer");
        peerConnection.createOffer().then(function (offer) {
            return peerConnection.setLocalDescription(offer);
        }).then(function () {
            console.log(peerConnection.localDescription.sdp);
            socket.emit('message', peerConnection.localDescription);
        });
    }
});
