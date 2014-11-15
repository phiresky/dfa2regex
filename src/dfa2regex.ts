// compiled from typescript dfa2regex.ts
enum Type {
	Or, Concat, Maybe, Star, Plus
}
class Regex {
	static joinChar = ['|','','','',''];
	static parens = [true, true, false, false, false];
	static suffix = ['','','?','*','+'];
	constructor(public type:Type, public val:Regex[]) {}
	
	toString() {
		var p = this.val.length>1&&Regex.parens[this.type];
		return (p?'(':'')+this.val.join(Regex.joinChar[this.type]) + Regex.suffix[this.type] + (p?')':'');
	}
}

function simplify(r:Regex) {
	if(typeof r == 'string') return r;
	r.val = r.val.map(x=>simplify(x));
	for(var i = 0; i < r.val.length; i++) {
		if(r.val[i].type == r.type && !Regex.suffix[r.type]) {
			r.val = r.val.slice(0,i).concat(r.val[i].val).concat(r.val.slice(i+1));
		}
	}
	switch(r.type) {
		case Type.Or:
			if(r.val.length == 1) return r.val[0];
			if(r.val.length == 2) {
				// (x|ε) => (x?)
				if(r.val[0].toString() == 'ε') {
					r.val.shift(); r.type = Type.Maybe;
				}
				else if(r.val[1].toString() == 'ε') {
					r.val.pop(); r.type = Type.Maybe;
				}
			}
			for(var i=0;i<r.val.length-1;i++) {
				var a = r.val[i], b = r.val[i+1];
				// (a|b*a) => b*a
				if(b.type == Type.Concat && b.val.length==2
						&& b.val[0].type == Type.Star
						&& b.val[1].toString() == a.toString()) {
					r.val.splice(i--,1);
				}
			}
		break;
		case Type.Star:
			// (x*?) => (x*)
			if(r.val[0].type == Type.Maybe) r.val = r.val[0].val;
		break;
		case Type.Maybe:
			// (x?*) => (x*)
			if(r.val[0].type == Type.Star) r = r.val[0];
		break;
		case Type.Concat:
			if(r.val.length == 1) return r.val[0];
			for(var i=0;i<r.val.length-1;i++) {
				var a = r.val[i], b = r.val[i+1];
				// (x?x*) => (x*)
				if(a.type==Type.Maybe&&b.type==Type.Star
						&& a.val[0].toString() == b.val[0].toString()) {
					r.val.splice(i--,1);
				}
				// (xx*) => (x+)
				else if(b.type==Type.Star &&
						a.toString() == b.val[0].toString()) {
					r.val.splice(i--,1);
					b.type = Type.Plus;
				}
				// (x*x) => (x+)
				else if(a.type==Type.Star &&
						b.toString() == a.val[0].toString()) {
					r.val.splice(i-- +1,1);
					a.type = Type.Plus;
				}

			}
		break;
	}
	return r;
}

class Automat {
	constructor(inp:string) { // parse regex from string a→b:c,d
		var getId = (name:string) => {
			var inx = this.names.indexOf(name);
			if(inx>=0) return inx;
			else return this.names.push(name) - 1;
		};
		inp.split('\n')
			.map(line => line.trim())
			.filter(line => line.length > 0)
			.forEach(line => {
				var from = getId(line[0]), to = getId(line[2]);
				var outp = new Regex(Type.Or,
						<any[]>line.split(":")[1].split(",").map(x => x.trim()));
				this.map[from] = this.map[from] || [];
				this.map[from][to] = outp;
			});
	}
	names:string[] = [];
	map:Regex[][] = [];
}
var or = (...x:Regex[]) => new Regex(Type.Or, x),
	concat = (...x:Regex[]) => new Regex(Type.Concat, x),
	star = (...x:Regex[]) => new Regex(Type.Star, x);

// convert Automat to regex, going from state q1 to q2,
// using only states from 0 to i
var L = (a:Automat,q1:number,i:number,q2:number) =>
	(i<0) ? a.map[q1][q2] : or(
		L(a,q1,i-1,q2),
		concat(
			L(a,q1,i-1,i), star(L(a,i,i-1,i)), L(a,i,i-1,q2)
		)
	);
declare var input:HTMLTextAreaElement, output:HTMLPreElement;

function convert() {
	var automat = new Automat(input.value);
	var maxState = automat.names.length - 1;
	var regex = L(automat,0,maxState,maxState);
	output.textContent = regex + "\n\nsimplified:\n" + simplify(regex);
}
convert();
