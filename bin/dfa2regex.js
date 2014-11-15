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
            }
            break;
    }
    return r;
}
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
}, literals = function (x) { return new Regex(0 /* Or */, x); };
var L = function (q1, i, q2) { return (i == 0) ? literals(automat[q1][q2]) : or(L(q1, i - 1, q2), concat(L(q1, i - 1, i), star(L(i, i - 1, i)), L(i, i - 1, q2))); };
var automat = {
    '1': {
        '1': ['ε', '0'],
        '2': ['1']
    },
    '2': {
        '2': ['ε', '1'],
        '1': ['0']
    }
};
document.write(simplify(L(1, 2, 2)).toString());
