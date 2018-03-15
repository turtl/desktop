.PHONY: all clean release run

# non-versioned include
-include vars.mk

export SHELL := /bin/bash
export BUILD := build
export RELEASE := release

mkdir = @mkdir -p $(dir $@)

CONFIG_FILE := config.js
ELECTRON := ./node_modules/.bin/electron

allcss = $(shell find ../js/css/ -name "*.css" \
			| grep -v 'reset.css')
alljs = $(shell echo "../js/main.js" \
			&& find ../js/{config,controllers,handlers,lib,models} -name "*.js" \
			| grep -v '(ignore|\.thread\.)')
alljsassets = $(shell find ../js -type f | grep -v '\.git' | grep -v 'node_modules' | grep -v 'build')
alllibs = $(shell find lib/ -name "*.js")
allrs = $(shell find ../core/ -name "*.rs")
rustbin = $(shell ./scripts/rustbin.sh)

libprefix := lib
libsuffix := so
ifneq (,$(findstring NT, $(OS)))
	libprefix :=
	libsuffix := dll
endif
ifneq (,$(findstring Darwin, $(OS)))
	libsuffix := dylib
endif

all: $(BUILD)/$(libprefix)turtl_core.$(libsuffix) $(BUILD)/config.yaml $(BUILD)/clippo/parsers.yaml $(BUILD)/make-js $(BUILD)/config.js $(BUILD)/index.html $(BUILD)/popup.html

$(RELEASE)/package.nw: all
	./scripts/package $@

package: $(RELEASE)/package.nw

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

$(BUILD)/config.yaml: ../core/config.yaml
	$(mkdir)
	@echo "- core config: " $?
	@cp $? $@

$(BUILD)/clippo/parsers.yaml: ../core/clippo/parsers.yaml
	$(mkdir)
	@echo "- core parsers.yaml: " $?
	@cp $? $@

$(BUILD)/$(libprefix)turtl_core.$(libsuffix): $(allrs)
	@test -d "$(@D)" || mkdir -p "$(@D)"
	@echo "- core build: " $?
	@cd ../core && make CARGO_BUILD_ARGS=$(CARGO_BUILD_ARGS) release
	cp $(rustbin)/$(libprefix)std-*.$(libsuffix) $(BUILD)/
	cp ../core/target/release/$(libprefix)turtl_core.$(libsuffix) $(BUILD)/

$(BUILD)/$(libprefix)std-*.$(libprefix): 

$(BUILD)/config.js: config/$(CONFIG_FILE)
	@echo "- Config: " $?
	@cp config/$(CONFIG_FILE) $@

$(BUILD)/make-js: $(alljs) $(allcss)
	@test -d "$(@D)" || mkdir -p "$(@D)"
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

clean:
	rm -rf $(BUILD)

