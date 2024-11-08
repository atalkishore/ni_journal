const NormalD = {
    /**
     * from http://www.math.ucla.edu/~tom/distributions/normal.html
     * @param {Number} X
     * @returns {Number|NormalD.normalcdf.D|NormalD.normalcdf.T}
     */
    normalcdf: function (X) { // HASTINGS.  MAX ERROR = .000001
        const T = 1 / (1 + 0.2316419 * Math.abs(X))
        let D = 0.3989423 * Math.exp(-X * X / 2)
        let Prob = D * T * (0.3193815 + T * (-0.3565638 + T * (1.781478 + T * (-1.821256 + T * 1.330274))))
        if (X > 0) {
            Prob = 1 - Prob
        }
        return Prob
    },
    /**
     * from http://www.math.ucla.edu/~tom/distributions/normal.html
     * @param {Number} Z x-Value
     * @param {Number} M mean (µ)
     * @param {Number} SD standard deviation
     * @returns {Number|@exp;normalcdf@pro;Prob|@exp;normalcdf@pro;D|@exp;normalcdf@pro;T|normalcdf.Prob|@exp;Math@call;exp|normalcdf.D|@exp;Math@call;abs|normalcdf.T}
     */
    compute: function (Z, M, SD) {
        let Prob
        if (SD < 0) {
            // $C.e('normal', 'The standard deviation must be nonnegative.')
        } else if (SD === 0) {
            if (Z < M) {
                Prob = 0
            } else {
                Prob = 1
            }
        } else {
            Prob = NormalD.normalcdf((Z - M) / SD)
            Prob = Math.round(100000 * Prob) / 100000
        }

        return Prob
    },
    /**
     * standard normal distribution.
     * @param {Number} Z x-Value
     * @returns {Number|normalcdf.D|normalcdf.T|normalcdf.Prob}
     */
    stdcompute: function (Z) {
        return NormalD.compute(Z, 0, 1)
    },
    /**
     * standard density function
     * @param {type} x Value
     * @returns {Number}
     */
    stdpdf: function (x) {
        const m = Math.sqrt(2 * Math.PI)
        const e = Math.exp(-Math.pow(x, 2) / 2)
        return e / m
    }
}
/**
 * Call: C = S * N(d1) - K * exp (-rt) * N(d2)
 * Put: P = K * exp (-rt) * N(-d2) - S * N(-d1)
 * @type type
 */
const BS = {
    /**
     *
     *
     * @param {BSHolder} BSHolder Holder der BS-Variablen
     * @returns {Number|normalcdf.D|normalcdf.T|normalcdf.Prob} Fairen Preis
     */
    call: function (BSHolder) {
        const d1 = (Math.log(BSHolder.stock / BSHolder.strike) + (BSHolder.interest + 0.5 * Math.pow(BSHolder.vola, 2)) * BSHolder.term) / (BSHolder.vola * Math.sqrt(BSHolder.term))
        const d2 = d1 - (BSHolder.vola * Math.sqrt(BSHolder.term))
        const res = Math.round((BSHolder.stock * NormalD.stdcompute(d1) - BSHolder.strike * Math.exp(-BSHolder.interest * BSHolder.term) * NormalD.stdcompute(d2)) * 100) / 100
        if (isNaN(res)) {
            return 0
        }
        return res
    },
    /**
     *
     *
     * @param {BSHolder} BSHolder Holder der BS-Variablen
     * @returns {Number|normalcdf.D|normalcdf.T|normalcdf.Prob} Fairen Preis
     */
    put: function (BSHolder) {
        const d1 = (Math.log(BSHolder.stock / BSHolder.strike) + (BSHolder.interest + 0.5 * Math.pow(BSHolder.vola, 2)) * BSHolder.term) / (BSHolder.vola * Math.sqrt(BSHolder.term))
        const d2 = d1 - (BSHolder.vola * Math.sqrt(BSHolder.term))
        const res = Math.round((BSHolder.strike * Math.pow(Math.E, -BSHolder.interest * BSHolder.term) * NormalD.stdcompute(-d2) - BSHolder.stock * NormalD.stdcompute(-d1)) * 100) / 100
        if (isNaN(res)) {
            return 0
        }
        return res
    },
    cdelta: function (h) {
        const d1 = (Math.log(h.stock / h.strike) + (h.interest + 0.5 * Math.pow(h.vola, 2)) * h.term) / (h.vola * Math.sqrt(h.term))
        const res = Math.max(NormalD.stdcompute(d1), 0)
        if (isNaN(res)) {
            return 0
        }
        return res
    },
    pdelta: function (h) {
        const d1 = (Math.log(h.stock / h.strike) + (h.interest + 0.5 * Math.pow(h.vola, 2)) * h.term) / (h.vola * Math.sqrt(h.term))
        const res = Math.min(NormalD.stdcompute(d1) - 1, 0)
        if (isNaN(res)) {
            return 0
        }
        return res
    },
    gamma: function (h) {
        const d1 = (Math.log(h.stock / h.strike) + (h.interest + 0.5 * Math.pow(h.vola, 2)) * h.term) / (h.vola * Math.sqrt(h.term))
        const phi = NormalD.stdpdf(d1)
        const res = Math.max(phi / (h.stock * h.vola * Math.sqrt(h.term)), 0)

        if (isNaN(res)) {
            return 0
        }
        return res
    },
    vega: function (h) {
        const d1 = (Math.log(h.stock / h.strike) + (h.interest + 0.5 * Math.pow(h.vola, 2)) * h.term) / (h.vola * Math.sqrt(h.term))
        const phi = NormalD.stdpdf(d1)
        const res = Math.max(h.stock * phi * Math.sqrt(h.term), 0)
        if (isNaN(res)) {
            return 0
        }
        return res
    },
    ctheta: function (h) {
        const d1 = (Math.log(h.stock / h.strike) + (h.interest + 0.5 * Math.pow(h.vola, 2)) * h.term) / (h.vola * Math.sqrt(h.term))
        const d2 = d1 - (h.vola * Math.sqrt(h.term))
        const phi = NormalD.stdpdf(d1)
        const s = -(h.stock * phi * h.vola) / (2 * Math.sqrt(h.term))
        const k = h.interest * h.strike * Math.exp(-h.interest * h.term) * NormalD.normalcdf(d2)
        const res = Math.min(s - k, 0)
        if (isNaN(res)) {
            return 0
        }
        return res
    },
    ptheta: function (h) {
        const d1 = (Math.log(h.stock / h.strike) + (h.interest + 0.5 * Math.pow(h.vola, 2)) * h.term) / (h.vola * Math.sqrt(h.term))
        const d2 = d1 - (h.vola * Math.sqrt(h.term))
        const phi = NormalD.stdpdf(d1)
        const s = -(h.stock * phi * h.vola) / (2 * Math.sqrt(h.term))
        const k = h.interest * h.strike * Math.exp(-h.interest * h.term) * NormalD.normalcdf(-d2)
        const res = Math.min(s + k, 0)
        if (isNaN(res)) {
            return 0
        }
        return res
    },
    crho: function (h) {
        const d1 = (Math.log(h.stock / h.strike) + (h.interest + 0.5 * Math.pow(h.vola, 2)) * h.term) / (h.vola * Math.sqrt(h.term))
        const nd2 = NormalD.normalcdf(d1 - (h.vola * Math.sqrt(h.term)))
        const res = Math.max(h.term * h.strike * Math.exp(-h.interest * h.term) * nd2, 0)
        if (isNaN(res)) {
            return 0
        }
        return res
    },
    prho: function (h) {
        const d1 = (Math.log(h.stock / h.strike) + (h.interest + 0.5 * Math.pow(h.vola, 2)) * h.term) / (h.vola * Math.sqrt(h.term))
        const nnd2 = NormalD.normalcdf(-(d1 - (h.vola * Math.sqrt(h.term))))
        const res = Math.min(-h.term * h.strike * Math.exp(-h.interest * h.term) * nnd2, 0)
        if (isNaN(res)) {
            return 0
        }
        return res
    },
    comega: function (h) {
        const d1 = (Math.log(h.stock / h.strike) + (h.interest + 0.5 * Math.pow(h.vola, 2)) * h.term) / (h.vola * Math.sqrt(h.term))
        const nd2 = NormalD.normalcdf(d1 - (h.vola * Math.sqrt(h.term)))
        const res = nd2 * (h.stock / BS.call(h))
        if (isNaN(res)) {
            return 0
        }
        return res
    },
    pomega: function (h) {
        const d1 = (Math.log(h.stock / h.strike) + (h.interest + 0.5 * Math.pow(h.vola, 2)) * h.term) / (h.vola * Math.sqrt(h.term))
        const nd2 = NormalD.normalcdf(d1 - (h.vola * Math.sqrt(h.term)))
        const res = (nd2 - 1) * (h.stock / BS.put(h))
        if (isNaN(res)) {
            return 0
        }
        return res
    }
}

/**
 * Behälter für die BlackScholes Variablen
 *
 * @param {Float} stock underlying's asset price
 * @param {Float} strike strike price
 * @param {Float} interest annualized risk-free interest rate
 * @param {Float} vola volatility
 * @param {number} term a time in years
 * @returns {BSHolder}
 */
let BSHolder =
    function (
        stock,
        strike,
        interest,
        vola,
        term) {
        this.stock = Math.max(stock, 0)
        this.strike = Math.max(strike, 0)
        this.interest = Math.max(interest, 0)
        this.vola = Math.max(vola, 0)
        this.term = Math.max(term, 0)

        this.setStock = function (s) {
            if (typeof s === 'undefined') {
                return this.stock
            } else {
                this.stock = Math.max(s, 0)
                return this
            }
        }

        this.setStrike = function (s) {
            if (typeof s === 'undefined') {
                return this.strike
            } else {
                this.strike = Math.max(s, 0)
                return this
            }
        }
        this.setInterest = function (s) {
            if (typeof s === 'undefined') {
                return this.interest
            } else {
                this.interest = Math.max(s, 0)
                return this
            }
        }
        this.setVola = function (s) {
            if (typeof s === 'undefined') {
                return this.vola
            } else {
                this.vola = Math.max(s, 0)
                return this
            }
        }
        this.setTerm = function (s) {
            if (typeof s === 'undefined') {
                return this.term
            } else {
                this.term = Math.max(s, 0)
                return this
            }
        }
    }

module.exports.BS = BS
module.exports.BSHolder = BSHolder
