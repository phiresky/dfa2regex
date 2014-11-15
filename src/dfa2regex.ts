enum Type {
	Or, Concat, Maybe, Star, Plus
}
function simplify(r:Regex) {
	if(typeof r == 'string') return r;
	r.val.map(x=>simplify(x));
	for(var i = 0; i < r.val.length; i++) {
		if(r.val[i].type == r.type && !Regex.suffix[r.type]) {
			r.val = r.val.slice(0,i).concat(r.val[i].val).concat(r.val.slice(i+1));
		}
	}
	switch(r.type) {
		case Type.Or:
			if(r.val.length == 1) return r.val[0];
			if(r.val.length == 2) {
				if(r.val[0].toString() == 'ε') { r.val.shift(); r.type = Type.Maybe;}
				else if(r.val[1].toString() == 'ε') { r.val.pop(); r.type = Type.Maybe;}
			}
		break;
		case Type.Concat:
			if(r.val.length == 1) return r.val[0];
			for(var i=0;i<r.val.length-1;i++) {
				var a = r.val[i], b = r.val[i+1];
				if(a.type==Type.Maybe&&b.type==Type.Star&&a.val[0].toString()==b.val[0].val[0].toString()) {
					r.val.splice(i--,1);
				}
				else if(b.type==Type.Star && a.toString() == b.val[0].toString()) {
					r.val.splice(i--,1);
					b.type = Type.Plus;
				}
			}
		break;
	}
	return r;
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
var or = x => new Regex(Type.Or, x),
	concat = x => new Regex(Type.Concat, x),
	star = x => new Regex(Type.Star, x);
	
var L = (q1:number,i:number,q2:number) =>
	(i==0) ? or(automat[q1][q2]) : or([
		L(q1,i-1,q2),
		concat([
			L(q1,i-1,i), star([L(i,i-1,i)]), L(i,i-1,q2)
		])
	]);

var automat = {
	'1':{
		'1':['ε','0'],
		'2':['1'],
	},
	'2':{
		'2':['ε','1'],
		'1':['0']
	}
};

document.write(simplify(L(1,2,2)).toString());
