#!/bin/sh
echo "Starting servers..."
mrt >/dev/null &
sleep 3  # wait for mrt start
METEOR_MOCHA_TEST_DIRS="$(pwd)/client/tests/" MONGO_URL="mongodb://127.0.0.1:3002/test_$(date +%s%N)" mrt -p 8000 >/dev/null &
sleep 3  # wait for mrt start

echo "Ready to test! Go to http://localhost:8000/test"
echo 'Use Ctrl+C to stop'
trap 'fuser 8000/tcp -k && fuser 3000/tcp -k' INT  # kill running servers on SIGINT
tail -f /dev/null  # wait forever for SIGINT
