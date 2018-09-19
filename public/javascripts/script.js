$(function () {
    // get query string param
    var urlParams = new URLSearchParams(location.search);
    var username = urlParams.get('username'); 

    const socket = io('http://localhost:3000?username=' + username);
    const localVideo = document.querySelector('#localVideo');
    const startVideo = document.querySelector('#startVideo');
    var localMediaStream = null;
    var peerConnection = null;

    socket.on('offer', (offer) => {
        console.log("SDP Offer received: ", offer.sdp);
        handleVideoOfferMsg(offer);
    });

    socket.on('answer', (answer) => {
        console.log("SDP Answer received: ", answer.sdp);
        //handleVideoOfferMsg(offer);
    });

    socket.on('new-ice-candidate', (ice) => {
        console.log("New ice candidate received: ", ice);
    });

    startVideo.addEventListener('click', () => {
        getLocalMedia();
    });

    function getLocalMedia() {
        const contraints = {
            video: true,
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
        //peerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
        peerConnection.onicecandidate = handleICECandidateEvent;
    };

    function handleNegotiationNeededEvent() {
        console.log("create offer");
        /** Create an offer and send to the another peer */
        peerConnection.createOffer()
        .then((offer) => {
            return peerConnection.setLocalDescription(offer);
        }).then(function () {
            console.log(peerConnection.localDescription.sdp);
            var user = {
                name : 'mariouzae',
                type : 'offer',
                target : 'milenetvargas',
                sdp : peerConnection.localDescription
            };
            socket.emit('message', user);
        });
    };

    function handleVideoOfferMsg(offer) {
        console.log("Generating answer...");
        var localStream = null;
        const caller = offer.name;

        createPeerConnection();

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
            var user = {
                name : 'milenetvargas',
                type : 'answer',
                target : 'mariouzae',
                sdp : peerConnection.localDescription
            };
            socket.emit('message', user);
        }).catch();
    }

    function handleICECandidateEvent(ice) {
        console.log("Send ICE Candidate");
        // if(ice.candidate){
        //     var user = {
        //         name : 'mariouzae',
        //         type : 'new-ice-candidate',
        //         target : 'milenetvargas',
        //         sdp : peerConnection.localDescription
        //     };
        //     socket.emit('message', user);
        // }
    }
});
