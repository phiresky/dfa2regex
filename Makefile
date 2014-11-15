all: bin/dfa2regex.js bin/test.js

bin/%.js: src/%.ts
	tsc --outDir bin --noImplicitAny $<
