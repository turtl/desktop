.PHONY: all clean release run urn electron-rebuild package-electron release-windows release-linux release-osx

# non-versioned include
-include vars.mk

export SHELL := /bin/bash
export BUILD := build
export RELEASE := release

OS ?= $(shell uname)
mkdir = @mkdir -p $(dir $@)

CONFIG_FILE := config.js
ELECTRON := ./node_modules/.bin/electron
ELECTRON_REBUILD := ./node_modules/.bin/electron-rebuild

allcss = $(shell find ../js/css/ -name "*.css" \
			| grep -v 'reset.css')
alljs = $(shell echo "../js/main.js" \
			&& find ../js/{config,controllers,handlers,lib,models} -name "*.js" \
			| grep -v '(ignore|\.thread\.)')
alljsassets = $(shell find ../js -type f | grep -v '\.git' | grep -v 'node_modules' | grep -v 'build')
alllibs = $(shell find lib/ -name "*.js")
allrs = $(shell find ../core/ -name "*.rs")
version := $(shell cat package.json \
		| grep '"version"' \
		| sed -E 's|.*: +"([^"]+)".*|\1|')

libprefix := lib
libsuffix := so
ifneq (,$(findstring NT, $(OS)))
	libprefix :=
	libsuffix := dll
endif
ifneq (,$(findstring Darwin, $(OS)))
	libsuffix := dylib
endif

all: $(BUILD)/turtl_core.$(libsuffix) $(BUILD)/config.yaml $(BUILD)/clippo/parsers.yaml $(BUILD)/make-js $(BUILD)/config.js $(BUILD)/index.html $(BUILD)/popup.html

release: override CONFIG_FILE := config.live.js
release: package
	./scripts/release

run: all
	$(ELECTRON) .

run-bat: all
	start "scripts\debug-win.bat"

urn: 
	@echo "Is there a Ralphs around here?"

$(BUILD)/app/index.html: $(alljsassets) $(allcss) ../js/index.html
	$(mkdir)
	@cd ../js && make
	@echo "- rsync project: " $?
	@rsync \
		-azz \
		--exclude=node_modules \
		--exclude=.git \
		--exclude=tests \
		--delete \
		--delete-excluded \
		--checksum \
		../js/ \
		$(BUILD)/app
	@touch $@

$(BUILD)/config.yaml: ../core/config.yaml.default
	$(mkdir)
	@echo "- core config: " $?
	@cp $? $@

$(BUILD)/clippo/parsers.yaml: ../core/clippo/parsers.yaml
	$(mkdir)
	@echo "- core parsers.yaml: " $?
	@cp $? $@

$(BUILD)/turtl_core.$(libsuffix): $(allrs)
	$(mkdir)
	@echo "- core build: " $?
	cd ../core && make CARGO_BUILD_ARGS=$(CARGO_BUILD_ARGS) release
	cp ../core/target/release/$(libprefix)turtl_core.$(libsuffix) $@

$(BUILD)/config.js: config/$(CONFIG_FILE)
	@echo "- Config: " $?
	@cp config/$(CONFIG_FILE) $@

$(BUILD)/make-js: $(alljs) $(allcss)
	$(mkdir)
	@cd ../js && make
	@touch $@

# if the app's index changed, we know to change this one
$(BUILD)/index.html: $(BUILD)/make-js $(BUILD)/app/index.html $(alllibs) ./scripts/gen-index
	@echo "- $@: " $?
	@./scripts/gen-index > $@

$(BUILD)/popup.html: lib/app/popup/index.html.tpl $(alllibs) ./scripts/gen-index
	@test -d "$(@D)" || mkdir -p "$(@D)"
	@echo "- $@: " $?
	@./scripts/gen-index popup > $@

electron-rebuild:
	$(ELECTRON_REBUILD)

clean:
	rm -rf $(BUILD)

package-electron: electron-rebuild all
	./node_modules/.bin/electron-packager \
		--overwrite \
		--prune \
		--executable-name=turtl \
		--icon=scripts/resources/favicon.128.ico \
		--out=target/ \
		.
	cp \
		config/config.live.js \
		`find target/ -type f | grep -v 'final/' | grep 'app/build/config.js' | head -1`

release-windows: package-electron
	cp \
		$(SSL_LIB_PATH)/libeay32.dll \
		$(SSL_LIB_PATH)/ssleay32.dll \
		`ls -d target/Turtl-* | head -1`
	./scripts/release/windows $(version) `ls -d target/Turtl-* | head -1`

release-linux: package-electron
	./scripts/release/linux $(version) `ls -d target/Turtl-* | head -1`

release-osx: package-electron
	./scripts/release/osx $(version) `ls -d target/Turtl-* | head -1`

