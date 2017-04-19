#!/bin/sh -

MONGO_URL=mongodb://citychrone_site:citychrone@130.192.68.192:5555/citychrone_site?authSource=admin NODE_OPTIONS="--max_old_space_size=4096"  meteor run --port 7000
