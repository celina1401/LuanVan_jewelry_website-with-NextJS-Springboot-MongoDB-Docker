#!/bin/bash

echo "Testing network connectivity..."

# Test if discoveryserver is reachable from reviewservice
echo "Testing discoveryserver connectivity from reviewservice container..."
docker-compose exec reviewservice ping -c 3 discoveryserver

# Test if the Eureka server is responding
echo "Testing Eureka server response..."
docker-compose exec reviewservice curl -f http://discoveryserver:8761/eureka/apps

# Check the logs of the discovery server
echo "Checking discovery server logs..."
docker-compose logs discoveryserver | tail -20

# Check the logs of the review service
echo "Checking review service logs..."
docker-compose logs reviewservice | tail -20 