.PHONY: all clean run release

NW := $(shell which nw)

allcss = $(shell find ../js/css/ -name "*.css" \
			| grep -v 'reset.css')
alljs = $(shell echo "../js/main.js" \
			&& find ../js/{config,controllers,handlers,library,models} -name "*.js" \
			| grep -v '(ignore|\.thread\.)')

all: .build/make-js data/index.html data/popup/index.html

run: all
	$(NW) .

data/app/index.html: $(alljs) $(allcss) ../js/index.html
	@echo "- rsync project: " $?
	@rsync \
			-az \
			--exclude=node_modules \
			--exclude=.git \
			--exclude=.build \
			--delete \
			--delete-excluded \
			--checksum \
			../js/ \
			data/app
	@touch data/app/index.html

.build/make-js: $(alljs) $(allcss)
	@cd ../js && make
	@touch .build/make-js

# if the app's index changed, we know to change this one
data/index.html: data/app/index.html ./scripts/gen-index
	@echo "- index.html: " $?
	@./scripts/gen-index

data/popup/index.html: data/popup/index.html.tpl ./scripts/gen-index
	@echo "- popup/index.html: " $?
	@./scripts/gen-index popup

clean:
	rm -rf data/app
	rm data/index.html
	rm data/popup/index.html

