.PHONY: all clean package release run

export SHELL := /bin/bash

NW := $(shell which nw)
NODE := $(shell which node)
OS := $(shell uname)

allrs = $(shell find ../core/ -name "*.rs")
allcss = $(shell find ../js/css/ -name "*.css" \
			| grep -v 'reset.css')
alljs = $(shell echo "../js/main.js" \
			&& find ../js/{config,controllers,handlers,library,models,turtl} -name "*.js" \
			| grep -v '(ignore|\.thread\.)')
allcontrollers = $(shell find data/controllers/ -name "*.js")

libprefix := lib
libsuffix := so
ifneq (,$(findstring NT-,$(OS)))
	libprefix :=
	libsuffix := dll
endif
ifneq (,$(findstring Darwin,$(OS)))
	libsuffix := dylib
endif

all: .build/$(libprefix)turtl_core.$(libsuffix) .build/$(libprefix)protected_derive.$(libsuffix) .build/make-js data/index.html data/popup/index.html

package: all
	./scripts/package

release: package
	./scripts/release

run: all
	$(NW) .

test: all
	@$(NODE) ./node_modules/jasmine/bin/jasmine.js

data/app/index.html: $(alljs) $(allcss) ../js/index.html
	@echo "- rsync project: " $?
	@rsync \
			-azz \
			--exclude=node_modules \
			--exclude=.git \
			--exclude=.build \
			--exclude=tests \
			--delete \
			--delete-excluded \
			--checksum \
			../js/ \
			data/app
	@touch data/app/index.html

.build/$(libprefix)turtl_core.$(libsuffix) .build/$(libprefix)protected_derive.$(libsuffix): $(allrs)
	@cd ../core && make release
	cp ../core/target/release/$(libprefix)turtl_core.$(libsuffix) .build/
	cp ../core/target/release/$(libprefix)protected_derive.$(libsuffix) .build/

.build/make-js: $(alljs) $(allcss)
	@cd ../js && make
	@touch .build/make-js

# if the app's index changed, we know to change this one
data/index.html: data/app/index.html $(allcontrollers) ./scripts/gen-index
	@echo "- data/index.html: " $?
	@./scripts/gen-index

data/popup/index.html: data/popup/index.html.tpl $(allcontrollers) ./scripts/gen-index
	@echo "- popup/index.html: " $?
	@./scripts/gen-index popup

clean:
	rm -rf data/app
	rm data/index.html
	rm data/popup/index.html

