class SDP {
    constructor(type, name, target, sdp) {
        this.type = type,
        this.name = name,
        this.target = target,
        this.sdp = sdp
    }

    getSDP() {
        return this.sdp;
    }
}

module.exports = SDP;