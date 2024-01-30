.POSIX:


SRC=$(wildcard *.aseprite */*.aseprite)
IMAGES=$(SRC:.aseprite=.png)
DATA=$(SRC:.aseprite=.aseprite.json)

ASEPRITE=aseprite \
    --batch \
    --format json-array \
	--sheet-pack \
	--merge-duplicates \
	--extrude \
	--list-tags \
	--list-layers \
	--trim

%.png: %.aseprite Makefile
	$(ASEPRITE) --data $<.json --sheet $@ $<

all: $(IMAGES)

clean:
	$(RM) $(IMAGES) $(DATA)


.PHONY: all clean
