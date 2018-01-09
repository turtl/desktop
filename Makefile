.PHONY: all clean release run

# non-versioned include
-include vars.mk

export SHELL := /bin/bash
export BUILD := build
export RELEASE := release
CONFIG_FILE := config.js

ELECTRON := ./node_modules/.bin/electron

allcss = $(shell find ../js/css/ -name "*.css" \
			| grep -v 'reset.css')
alljs = $(shell echo "../js/main.js" \
			&& find ../js/{config,controllers,handlers,lib,models,turtl} -name "*.js" \
			| grep -v '(ignore|\.thread\.)')
alllibs = $(shell find lib/ -name "*.js")
allrs = $(shell find ../core/ -name "*.rs")

libprefix := lib
libsuffix := so
ifneq (,$(findstring NT, $(OS)))
	libprefix :=
	libsuffix := dll
endif
ifneq (,$(findstring Darwin, $(OS)))
	libsuffix := dylib
endif

all: $(BUILD)/$(libprefix)turtl_core.$(libsuffix) $(BUILD)/config.yaml $(BUILD)/make-js $(BUILD)/config.js $(BUILD)/index.html $(BUILD)/popup/index.html

$(RELEASE)/package.nw: all
	./scripts/package $@

package: $(RELEASE)/package.nw

release: override CONFIG_FILE := config.live.js
release: package
	./scripts/release

run: all
	$(ELECTRON) --user-data-dir=$(TMP)/userdata .

$(BUILD)/app/index.html: $(alljs) $(allcss) ../js/index.html
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
	@echo "- core config: " $?
	@cp $? $@

$(BUILD)/$(libprefix)turtl_core.$(libsuffix): $(allrs)
	@test -d "$(@D)" || mkdir -p "$(@D)"
	@echo "- core build: " $?
	@cd ../core && make CARGO_BUILD_ARGS=$(CARGO_BUILD_ARGS) release
	cp ../core/target/release/$(libprefix)turtl_core.$(libsuffix) $(BUILD)/

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

$(BUILD)/popup/index.html: lib/popup/index.html.tpl $(alllibs) ./scripts/gen-index
	@test -d "$(@D)" || mkdir -p "$(@D)"
	@echo "- $@: " $?
	@./scripts/gen-index popup > $@

clean:
	rm -rf $(BUILD)

