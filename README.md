dfa2regex
=========

Converts Deterministic finite automata to regular expressions.

[Hosted Version](http://phiresky.github.io/dfa2regex/)

Example:

![dfa](http://i.imgur.com/l9AfjRM.png)

Becomes

    ((1|((ε|0)(ε|0)*1))|((1|((ε|0)(ε|0)*1))((ε|1)|(0(ε|0)*1))*((ε|1)|(0(ε|0)*1))))

Which is automatically simplified to

    ((0*1)|((0*1)(1?|(0+1))+))


The algorithm itself is short:
https://github.com/phiresky/dfa2regex/blob/gh-pages/src/dfa2regex.ts#L108-L116
