// compiled from typescript dfa2regex.ts
var Type;
(function (Type) {
    Type[Type["Or"] = 0] = "Or";
    Type[Type["Concat"] = 1] = "Concat";
    Type[Type["Maybe"] = 2] = "Maybe";
    Type[Type["Star"] = 3] = "Star";
    Type[Type["Plus"] = 4] = "Plus";
})(Type || (Type = {}));
var Regex = (function () {
    function Regex(type, val) {
        this.type = type;
        this.val = val;
    }
    Regex.prototype.toString = function () {
        var p = this.val.length > 1 && Regex.parens[this.type];
        return (p ? '(' : '') + this.val.join(Regex.joinChar[this.type]) + Regex.suffix[this.type] + (p ? ')' : '');
    };
    Regex.joinChar = ['|', '', '', '', ''];
    Regex.parens = [true, true, false, false, false];
    Regex.suffix = ['', '', '?', '*', '+'];
    return Regex;
})();
function simplify(r) {
    if (typeof r == 'string')
        return r;
    r.val = r.val.map(function (x) { return simplify(x); });
    for (var i = 0; i < r.val.length; i++) {
        if (r.val[i].type == r.type && !Regex.suffix[r.type]) {
            r.val = r.val.slice(0, i).concat(r.val[i].val).concat(r.val.slice(i + 1));
        }
    }
    switch (r.type) {
        case 0 /* Or */:
            if (r.val.length == 1)
                return r.val[0];
            if (r.val.length == 2) {
                // (x|ε) => (x?)
                if (r.val[0].toString() == 'ε') {
                    r.val.shift();
                    r.type = 2 /* Maybe */;
                }
                else if (r.val[1].toString() == 'ε') {
                    r.val.pop();
                    r.type = 2 /* Maybe */;
                }
            }
            for (var i = 0; i < r.val.length - 1; i++) {
                var a = r.val[i], b = r.val[i + 1];
                // (a|b*a) => b*a
                if (b.type == 1 /* Concat */ && b.val.length == 2 && b.val[0].type == 3 /* Star */ && b.val[1].toString() == a.toString()) {
                    r.val.splice(i--, 1);
                }
            }
            break;
        case 3 /* Star */:
            // (x*?) => (x*)
            if (r.val[0].type == 2 /* Maybe */)
                r.val = r.val[0].val;
            break;
        case 2 /* Maybe */:
            // (x?*) => (x*)
            if (r.val[0].type == 3 /* Star */)
                r = r.val[0];
            break;
        case 1 /* Concat */:
            if (r.val.length == 1)
                return r.val[0];
            for (var i = 0; i < r.val.length - 1; i++) {
                var a = r.val[i], b = r.val[i + 1];
                // (x?x*) => (x*)
                if (a.type == 2 /* Maybe */ && b.type == 3 /* Star */ && a.val[0].toString() == b.val[0].toString()) {
                    r.val.splice(i--, 1);
                }
                else if (b.type == 3 /* Star */ && a.toString() == b.val[0].toString()) {
                    r.val.splice(i--, 1);
                    b.type = 4 /* Plus */;
                }
                else if (a.type == 3 /* Star */ && b.toString() == a.val[0].toString()) {
                    r.val.splice(i-- + 1, 1);
                    a.type = 4 /* Plus */;
                }
            }
            break;
    }
    return r;
}
var Automat = (function () {
    function Automat(inp) {
        var _this = this;
        this.names = [];
        this.map = [];
        var getId = function (name) {
            var inx = _this.names.indexOf(name);
            if (inx >= 0)
                return inx;
            else
                return _this.names.push(name) - 1;
        };
        inp.split('\n').map(function (line) { return line.trim(); }).filter(function (line) { return line.length > 0; }).forEach(function (line) {
            var from = getId(line[0]), to = getId(line[2]);
            var outp = new Regex(0 /* Or */, line.split(":")[1].split(",").map(function (x) { return x.trim(); }));
            _this.map[from] = _this.map[from] || [];
            _this.map[from][to] = outp;
        });
    }
    return Automat;
})();
var or = function () {
    var x = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        x[_i - 0] = arguments[_i];
    }
    return new Regex(0 /* Or */, x);
}, concat = function () {
    var x = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        x[_i - 0] = arguments[_i];
    }
    return new Regex(1 /* Concat */, x);
}, star = function () {
    var x = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        x[_i - 0] = arguments[_i];
    }
    return new Regex(3 /* Star */, x);
};
// convert Automat to regex, going from state q1 to q2,
// using only states from 0 to i
var L = function (a, q1, i, q2) { return (i < 0) ? a.map[q1][q2] : or(L(a, q1, i - 1, q2), concat(L(a, q1, i - 1, i), star(L(a, i, i - 1, i)), L(a, i, i - 1, q2))); };
function convert() {
    var automat = new Automat(input.value);
    var maxState = automat.names.length - 1;
    var regex = L(automat, 0, maxState, maxState);
    output.textContent = regex + "\n\nsimplified:\n" + simplify(regex);
}
convert();
