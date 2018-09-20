class ICE {
    constructor(type, name, target, candidate) {
        this.type = type,
        this.target = target,
        this.candidate = candidate
    }

    getCandidate() {
        return this.candidate;
    }
}

module.exports = ICE;