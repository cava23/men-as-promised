#!/bin/sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
mkdir -p "$DIR/data/mongodb"
mongod --dbpath "$DIR/data/mongodb"
