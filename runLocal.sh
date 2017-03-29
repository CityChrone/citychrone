#!/bin/sh -
MONGO_URL=mongodb://localhost:27017/citychrone NODE_OPTIONS="--max_old_space_size=4096"  meteor run --port 7000
