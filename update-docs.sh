#!/bin/sh

set -e

# split out API
csplit README.md '/## API/' '{*}'

mv xx00 ./docs/General.md
mv xx01 ./docs/API.md

## split out Error handling

csplit ./docs/General.md '/## Error handling/' '{*}'

mv xx00 ./docs/General.md
mv xx01 ./docs/ErrorHandling.md

## split out Configuration

csplit ./docs/General.md '/## Configuration/' '{*}'

mv xx00 ./docs/General.md
mv xx01 ./docs/Configuration.md

# Split out Basic Usage

csplit ./docs/General.md '/## Basic Usage/' '{*}'

mv xx00 ./docs/General.md
mv xx01 ./docs/Usage.md


## Get the license and badges part and put it back into main file
csplit ./docs/API.md '/## License/' '{*}'

mv ./xx00 ./docs/API.md
cat ./xx01 >> ./docs/General.md
rm ./xx01

## hide license from sidebar

sed -i 's|License|License <!-- {docsify-ignore} -->|' ./docs/General.md

## copy route template docs from the package

cp -f ./packages/route-template/README.md ./docs/RouteTemplate.md
