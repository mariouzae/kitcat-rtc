$(function () {
    // get query string param
    var urlParams = new URLSearchParams(location.search);
    var username = urlParams.get('username');
    var targetUsername = 'milenetvargas';

    const socket = io('https://kitcat-rtc.io:3000?username=' + username);
    const localVideo = document.querySelector('#localVideo');
    const startVideo = document.querySelector('#startVideo');
    const contraints = {
        video: true,
        audio: true
    };
    var localMediaStream = null;
    var peerConnection = null;


    socket.on('offer', (offer) => {
        /** When receive an offer, generate an answer and sent it to the other peer */
        console.log("SDP Offer received: ", offer);
        targetUsername = offer.name
        handleVideoOfferMsg(offer);
    });

    socket.on('answer', (answer) => {
        console.log("SDP Answer received: ", answer.sdp);
        //handleVideoOfferMsg(offer);
        var rtcDescription = new RTCSessionDescription(answer.sdp);
        peerConnection.setRemoteDescription(rtcDescription);
    });

    socket.on('new-ice-candidate', (ice) => {
        console.log("New ice candidate received: ", ice);
        peerConnection.addIceCandidate(ice.candidate)
        .then(console.log("ICE Candidate added...")).catch();
    });

    startVideo.addEventListener('click', () => {
        getLocalMedia();
    });

    function getLocalMedia() {
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
        handleNegotiationNeededEvent();
    };

    function createPeerConnection() {
        console.log("Creating an peerConnection");
        peerConnection = new RTCPeerConnection({
            iceServers: [     // Information about ICE servers - Use your own!
                {
                    urls: "stun:stun.stunprotocol.org"
                }
            ]
        });
        //peerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
        peerConnection.onicecandidate = e => handleICECandidateEvent(e);
        peerConnection.ontrack = handleTrackEvent;

    };

    function handleTrackEvent(event) {
        console.log("New track added");
        localVideo.srcObject = event.streams[0];
    }

    function handleNegotiationNeededEvent() {
        console.log("create offer:");
        /** Create an offer and send to the another peer */
        peerConnection.createOffer()
            .then((offer) => {
                return peerConnection.setLocalDescription(offer);
            }).then(function () {
                console.log("Sending offer SDP to other peers");
                var user = {
                    name: 'mariouzae',
                    type: 'offer',
                    target: 'milenetvargas',
                    sdp: peerConnection.localDescription
                };
                socket.emit('message', user);
            });
    };

    async function handleVideoOfferMsg(offer) {
        console.log("Generating answer...");
        var localStream = null;
        const caller = offer.name;
        console.log(caller);
        await createPeerConnection();

        var rtcDescription = new RTCSessionDescription(offer.sdp);

        peerConnection.setRemoteDescription(rtcDescription).then(() => {
            return navigator.mediaDevices.getUserMedia(contraints);
        }).then((stream) => {
            localStream = stream;
            localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
        }).then(() => {
            return peerConnection.createAnswer();
        }).then((answer) => {
            return peerConnection.setLocalDescription(answer);
        }).then(() => {
            console.log("Sending answer");
            var user = {
                name: 'milenetvargas',
                type: 'answer',
                target: 'mariouzae',
                sdp: peerConnection.localDescription
            };
            socket.emit('message', user);
        }).catch();
    }

    function handleICECandidateEvent(event) {
        console.log("Send ICE Candidate:", event);
        if (event.candidate) {
            var ice = {
                type: 'new-ice-candidate',
                target: targetUsername,
                candidate: event.candidate
            };
            socket.emit('message', ice);
        }
    }
});
