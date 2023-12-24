#!/bin/bash

echo "Initializing MongoDB replica set..."

mongosh --host localhost --port 27017 <<EOF
var config = {
  "_id": "rs0",
  "members": [
    {
      "_id": 0,
      "host": "localhost:27017"
    }
  ]
};

rs.initiate(config);
EOF

echo "Replica set initialized."
